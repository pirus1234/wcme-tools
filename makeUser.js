const {Pool} = require("pg")
const bcrypt = require("bcrypt")
require("dotenv").config() // Values stored in .env file

// Database configuration
const pgPool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: "localhost",
  database: "system11",
  port: 5432,
})

main = async () => {
  try {
    // Make commandline arguments into object
    const args = {
      user: process.argv[2],
      password: process.argv[3],
      applications: process.argv[4],
    }

    // Check for errors
    if (!args) throw new Error("Arguments not valid of missing")
    if (!args.password) throw new Error("Password missing")
    if (args.password.length < 6) throw new Error("Password too short")
    if (!args.user) throw new Error("User missing")
    if (!args.applications) throw new Error("Applications missing")

    // Check for duplicate in database
    //await pgPool.connect(config)
    const result = await pgPool.query(`SELECT * FROM users WHERE username = '${args.user}'`)
    if (result.rowCount !== 0) throw new Error("User already exists")

    // Generate hashed password with 15 salts - takes time
    const hash = bcrypt.hashSync(args.password, 15)
    console.log(hash)

    // Insert new user into database
    const result2 = await pgPool.query(`insert into users (username, password, applications) values ('${args.user}','${hash}','${args.applications}')`)
    if (result2.rowCount !== 1) throw new Error("Something went wrong!")

    // All done
    console.log("User added.")
  } catch (e) {
    // Errors
    console.log(e)
  }
  pgPool.end() // Close DB instance
}

main()
