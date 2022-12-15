require("dotenv").config({ path: "../.env" }) // for use of .env file
const snmp = require("net-snmp")
const { Server } = require("socket.io")
const UPSSession = snmp.createSession("172.16.0.110", "public")
const ServerSession = snmp.createSession("172.16.0.100", "public")
const FortiGateSession = snmp.createSession("172.16.0.3", "public")

const pgPool = require("../pgpool")

const OIDS = {
  UPS: {
    Battery_Remaining: "1.3.6.1.4.1.318.1.1.1.2.2.3.0",
    Battery_Temp: "1.3.6.1.4.1.318.1.1.1.2.2.2.0",
    UPS_Input_Voltage: "1.3.6.1.4.1.318.1.1.1.3.2.1.0",
    UPS_Output_Current: "1.3.6.1.4.1.318.1.1.1.4.2.4.0",
  },
  Server: {
    PSU1_Voltage: "1.3.6.1.4.1.674.10892.5.4.600.12.1.16.1.1",
    PSU2_Voltage: "1.3.6.1.4.1.674.10892.5.4.600.12.1.16.1.2",
    Power_State: "1.3.6.1.4.1.674.10892.5.2.4.0",
    CPU_Temp: "1.3.6.1.4.1.674.10892.5.4.700.20.1.6.1.1",
    Inlet_Temp: "1.3.6.1.4.1.674.10892.5.4.700.20.1.6.1.2",
    Exhaust_Temp: "1.3.6.1.4.1.674.10892.5.4.700.20.1.6.1.3",
  },
  FortiGate: {
    Inlet_Temp: "1.3.6.1.4.1.12356.101.4.3.2.1.3.4",
    Exhaust_Temp: "1.3.6.1.4.1.12356.101.4.3.2.1.3.3",
    CPU_Temp: "1.3.6.1.4.1.12356.101.4.3.2.1.3.5",
    BCM_Switch_Temp: "1.3.6.1.4.1.12356.101.4.3.2.1.3.6",
    B50185_Temp: "1.3.6.1.4.1.12356.101.4.3.2.1.3.7",
    B50210_1_Temp: "1.3.6.1.4.1.12356.101.4.3.2.1.3.8",
    B50210_2_Temp: "1.3.6.1.4.1.12356.101.4.3.2.1.3.9",
  },
}

const getUPSData = new Promise((resolv, reject) => {
  let UPSData = {}
  const values = Object.values(OIDS.UPS)
  const keys = Object.keys(OIDS.UPS)
  UPSSession.get(values, (error, varbinds) => {
    if (error) {
      reject()
    } else {
      varbinds[0].value = varbinds[0].value / 6000 // Output to minutes
      for (let i = 0; i < varbinds.length; i++) {
        UPSData[keys[i]] = varbinds[i].value
      }
    }
    UPSSession.close()
    resolv(UPSData)
  })
})

const getServerData = new Promise((resolv, reject) => {
  let ServerData = {}
  const values = Object.values(OIDS.Server)
  const keys = Object.keys(OIDS.Server)
  ServerSession.get(values, (error, varbinds) => {
    if (error) {
      reject()
    } else {
      for (let i = 0; i < varbinds.length; i++) {
        if (i > 2) varbinds[i].value = varbinds[i].value / 10 // divide temp values with 10
        ServerData[keys[i]] = varbinds[i].value
      }
    }
    ServerSession.close()
    resolv(ServerData)
  })
})

const getFortiGateData = new Promise((resolv, reject) => {
  let FortiGateData = {}
  const values = Object.values(OIDS.FortiGate)
  const keys = Object.keys(OIDS.FortiGate)
  FortiGateSession.get(values, (error, varbinds) => {
    if (error) {
      reject()
    } else {
      for (let i = 0; i < varbinds.length; i++) {
        FortiGateData[keys[i]] = Math.floor(varbinds[i].value)
      }
    }
    FortiGateSession.close()
    resolv(FortiGateData)
  })
})

const storeData = async () => {
  let data = await getData()
  console.log(data)
  let result = await pgPool.query(`
    INSERT INTO public."sysTracking" (
    "fgInletTemp", "fgExhaustTemp", "fgCPUTemp", "fgBCMSwitchTemp", "fgB50185Temp", "fgB50210_1Temp", "fgB50210_2Temp", "UPSBatRem", "UPSBatTemp", "UPSInputVoltage", "UPSOutputCurrent", "ServerPSU1Voltage", "ServerPSU2Voltage", "ServerPowerState", "ServerCPUTemp", "ServerInletTemp", "ServerExhaustTemp") VALUES (
    '${data.FortiGateData.Inlet_Temp}'::smallint, 
    '${data.FortiGateData.Exhaust_Temp}'::smallint, 
    '${data.FortiGateData.CPU_Temp}'::smallint, 
    '${data.FortiGateData.BCM_Switch_Temp}'::smallint, 
    '${data.FortiGateData.B50185_Temp}'::smallint, 
    '${data.FortiGateData.B50210_1_Temp}'::smallint, 
    '${data.FortiGateData.B50210_2_Temp}'::smallint, 
    '${data.UPSData.Battery_Remaining}'::integer, 
    '${data.UPSData.Battery_Temp}'::smallint, 
    '${data.UPSData.UPS_Input_Voltage}'::integer, 
    '${data.UPSData.UPS_Output_Current}'::smallint, 
    '${data.ServerData.PSU1_Voltage}'::integer, 
    '${data.ServerData.PSU2_Voltage}'::integer, 
    '${data.ServerData.Power_State}'::smallint, 
    '${data.ServerData.CPU_Temp}'::smallint, 
    '${data.ServerData.Inlet_Temp}'::smallint, 
    '${data.ServerData.Exhaust_Temp}'::smallint);
  `)
  if (!result.rowCount) {
    console.log("db error")
  }
}

//storeData(await UPSData, await UPSTemp, await serverData)
const getData = async () => {
  let UPSData, ServerData, FortiGateData
  try {
    UPSData = await getUPSData
    //console.log(UPSData)
  } catch (e) {
    UPSData = { UPSData: "Error" }
  }
  try {
    ServerData = await getServerData
  } catch (e) {
    ServerData = { ServerData: "Error" }
  }
  try {
    FortiGateData = await getFortiGateData
  } catch (e) {
    FortiGateData = { FortiGateData: "Error" }
  }
  console.log({FortiGateData, UPSData, ServerData})
  return { FortiGateData, UPSData, ServerData }
}
getData()
// INSERT INTO public."sysTracking" (
// "fgInletTemp", "fgExhaustTemp", "fgCPUTemp", "fgBCMSwitchTemp", "fgB50185Temp", "fgB50210_1Temp", "fgB50210_2Temp", "UPSBatRem", "UPSBatTemp", "UPSInputVoltage", "UPSOutputCurrent", "ServerPSU1Voltage", "ServerPSU2Voltage", "ServerPowerState", "ServerCPUTemp", "ServerInletTemp", "ServerExhaustTemp") VALUES (
//   '12'::smallint, '12'::smallint, '12'::smallint, '12'::smallint, '12'::smallint, '12'::smallint, '12'::smallint, '12'::integer, '12'::smallint, '12'::integer, '12'::smallint, '12'::integer, '12'::integer, '12'::smallint, '12'::smallint, '12'::smallint, '12'::smallint);
//    returning id;

module.exports = { storeData, ...globalThis }
