const jwt = require("jsonwebtoken")
const pgPool = require("../pgpool")
const ActiveDirectory = require("activedirectory")

function generateAccessToken(props) {
  return jwt.sign(props, process.env.TOKEN_SECRET, { expiresIn: "30d" })
}

// Failed and successful login attempts have the same timing

module.exports = async (req, res) => {
  const AD = await new ActiveDirectory({
    url: "ldap://172.16.10.11:389",
    bindDN: "user.name@wascoenergy.com",
    bindCredentials: "password",
    baseDN: "OU=Wasco Energy Group,DC=wascoenergy,DC=wasco,DC=global",
  })
  let userName = req.body.user
  try {
    if (req.body.user.split("@wascoenergy.com")[2])
      userName = req.body.user.split("@wascoenergy.com")[1]
    const result = await pgPool.query(
      `select * from users where username = '${userName}'`
    )
    if (result.rowCount === 0) {
      throw "Login attempt from user not found: " + userName
    }
    AD.authenticate(
      userName + "@wascoenergy.com",
      req.body.password,
      (err, auth) => {
        if (auth) {
          console.log("auth")
          const cookieToken = generateAccessToken({ userid: result.rows[0].id })
          res
            .cookie("token", cookieToken, {
              httpOnly: true,
              secure: false,
              sameSite: "strict",
              expires: new Date(Date.now() + 30 * 24 * 3600000),
              path: "/",
            })
            .status(200)
            .json({
              connection: "Granted",
              user: userName,
            })
        } else {
          res.status(401).json({})
        }
      }
    )
  } catch (e) {
    console.log(e)
    res.status(401).json({})
  }
}
