import { App, ExpressReceiver } from '@slack/bolt';
import { APIGatewayEvent, Context } from 'aws-lambda';
import * as dotenv from 'dotenv';
const fetch = require('node-fetch');

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

const headers = {
  'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`, 
  'Content-Type': 'application/json'
};

const channelMembers = async (channel: string) => {
  const res = await fetch(`https://slack.com/api/conversations.members?channel=${channel}`, { headers });
  const members = await res.json();
  console.log('rtn members:', members);
  return members.members;
}

export async function handler (event: APIGatewayEvent, context: Context) {
  // app.message(async ({ say }) => {
  //   await say("Hi :wave:");
  // });
  // console.log('event:', event);
  const payload = parseBody(event.body);
  // console.log('payload:', payload);
  const params = new URLSearchParams(payload);
  console.log('params:', params);
  let challenge;

  if (params.has('challenge') && params.has('type') && params.get('type') === 'url_verification') {
    challenge = params.get('challenge');
    console.log('challenge:', challenge);
    return {
      statusCode: 200,
      body: JSON.stringify({ challenge: challenge })
    };
  }

  console.log('payload event', payload.event);
  // if (params.has('channel_id') && params.has('')) {
  if (payload.event.channel) {
    console.log('we have channel_id and user_name');
    const channelId = payload.event.channel;
    //params.get('channel_id') || '';

    const members = await channelMembers(channelId);
    console.log('members:', members);
    // https://slack.com/api/conversations.members?channel=C03FD7EHTB6
    // U039V6KBLB0 = me
    // U02DR5KF1EC = evans
    // U03G0UPGT7S = picker

    const exclude = ['U03G0UPGT7S'];
    //@ts-ignore
    members.pop();
    console.log('members pop:', members);
    const chosenOne = members[Math.floor(Math.random()*members.length)];
    // members.filter( ( el ) => !exclude.includes( el ) );
    console.log('chosenOne:', chosenOne);
    const pickedBy = payload.event.user;;

    try {
      const options = {
        channel: channelId,
        token: `${process.env.SLACK_BOT_TOKEN}`,
        text: `<@${chosenOne}> you have been picked to lead standup by <@${pickedBy}>`
      }
      
      const result = await app.client.chat.postMessage(options);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
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
    body: "Hey <@Adam Glover>, you've been picked to lead stand up!"
  };
}