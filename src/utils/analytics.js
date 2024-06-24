import { google } from "googleapis";
import jsonCred from "../../config/google.analytics.js"
const { client_email, private_key: pKey } = jsonCred
const private_key = pKey.replace("/\\n/g", "\n")
const scopes = "https://www.googleapis.com/auth/analytics.readonly";
const view_id = "8097724010"
// export async function getToken() {


//     console.log(jwt)
//     return jwt
// }

export async function getViews() {
    const jwt = new google.auth.JWT(client_email, null, private_key, scopes)

    await jwt.authorize();

    const response = await google.analyticsreporting("v4").reports.batchGet({
        auth: jwt,
        // ids: "ga:" + view_id,
        // "start-date": "30daysAgo",
        // "end-date": "today",
        // metrics: "ga:pageviews"
        fields: "pageview"
    })
    console.log(response.data)
}
// const
// getToken()
// console.log()