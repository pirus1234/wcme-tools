import React, { lazy } from "react"

const Stacker = lazy(() => import("../Applications/Stacker/Stacker.js"))
const PCMS = lazy(() => import("../Applications/PCMS/PCMS.js"))

//import Account from "../Applications/Account/Account"
export const applicationTree = [
  {
    name: "Stacker Demo",
    iconColor: "#ff9933",
    icon: "fa-solid fa-cubes-stacked",
    component: <Stacker />,
  },
  {
    name: "RealXCell Demo",
    iconColor: "#a3a3ff",
    icon: "fa-solid fa-file-csv",
  },
  {
    name: "My Account",
    iconColor: "#66ccff",
    icon: "fa-solid fa-user-gear",
    component: [
      {
        name: "Change Password",
        iconColor: "#ccff99",
        icon: "fa-solid fa-key",
      },
    ],
  },
  {
    name: "Pipe Tracker",
    iconColor: "#ffffff",
    icon: "fa-solid fa-magnifying-glass",
  },
  {
    name: "Shared Folders",
    iconColor: "#ffdb8f",
    icon: "fa-solid fa-folder-tree",
  },
  {
    name: "Admin",
    iconColor: "#ff4d4d",
    icon: "fa-solid fa-screwdriver-wrench",
    component: [
      {
        name: "Add User",
        iconColor: "#80ff80",
        icon: "fa-solid fa-user-plus",
      },
      {
        name: "Delete User",
        iconColor: "#ff4d4d",
        icon: "fa-solid fa-user-xmark",
      },
      {
        name: "Shared Folder Privileges",
        iconColor: "#ffdb8f",
        icon: "fa-solid fa-folder-tree",
      },
      {
        name: "Services",
        iconColor: "#66ccff",
        icon: "fa-solid fa-list",
      },
      {
        name: "Application Access",
        iconColor: "#ff66a3",
        icon: "fa-solid fa-universal-access",
      },
      {
        name: "Dashboard",
        iconColor: "#80ff80",
        icon: "fa-solid fa-database",
      },
    ],
  },
  {
    name: "PCMS",
    iconColor: "#b3b3ff",
    icon: "fa-solid fa-industry",
    component: <PCMS />,
  },
]
