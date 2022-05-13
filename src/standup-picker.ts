import { App, ExpressReceiver } from '@slack/bolt';
import { APIGatewayEvent, Context } from 'aws-lambda';
import * as dotenv from 'dotenv';
import url from 'url';
import querystring from 'querystring';

dotenv.config();

const expressReceiver = new ExpressReceiver({
  signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
  processBeforeResponse: true
});

const app = new App({
  signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
  token: `${process.env.SLACK_BOT_TOKEN}`,
  receiver: expressReceiver
});

const parseBody = (body: string | null) => {
  try {
    return JSON.parse(body ?? "");
  } catch {
    return undefined;
  }
}

export async function handler (event: APIGatewayEvent, context: Context) {
  // app.message(async ({ say }) => {
  //   await say("Hi :wave:");
  // });
  console.log('event:', event);
  const payload = parseBody(event.body);
  const params = new URLSearchParams(payload);
  if (params.has('channel_id') && params.has('')) {
    console.log('we have channel_id and user_name');
    // team_id = workspace --> required by some APIs
    const channelId = params.get('channel_id') || '';
    const pickedBy = params.get('user_name');
    const chosenOne = 'Lucky one';
    const options = {
      channel: channelId,
      token: `${process.env.SLACK_BOT_TOKEN}`,
      text: `${chosenOne} you have been picked to lead standup by <@${pickedBy}>`
    }
    app.client.chat.postMessage(options);
    // ChatPostMessageArguments
  }
  // token=cOL8eifChRf6yBCQuxyii1eF&team_id=T02KH7E64&team_domain=purplebricks&channel_id=C03FD7EHTB6&channel_name=standup-test&user_id=U039V6KBLB0&user_name=andy.swinburne&command=%2Fstandup&text=&api_app_id=A03FPEP2P5X&is_enterprise_install=false&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT02KH7E64%2F3534647301121%2FTaHd6W7h2vbMRLFEulNyFSKc&trigger_id=3522001156835.2663252208.1556c6a6c278877ead11137df6dba302',

  // if(payload && payload.type && payload.type === 'url_verification') {
  //   return {
  //     statusCode: 200,
  //     body: payload.challenge
  //   };
  // }

  return {
    statusCode: 200,
    body: "Hello, I'm a netlify function from <@andy.swinburne!>"
  };
}