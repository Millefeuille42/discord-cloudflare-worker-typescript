/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import Env = Cloudflare.Env;
import {
	InteractionResponseType,
	InteractionType,
	InteractionResponseFlags,
	verifyKey,
} from 'discord-interactions';

import {INVITE_COMMAND, PERSON_COMMAND} from "../commands.ts";

type Interaction = {
	type: InteractionType | InteractionResponseType,
	data?: {
		name: string,
	},
}

class JsonResponse extends Response {
	constructor(body: any, init: ResponseInit | undefined = undefined) {
		const jsonBody = JSON.stringify(body);
		init = init || {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		};
		super(jsonBody, init);
	}
}

async function verifyDiscordRequest(request: Request, env: Env): Promise<{isValid: boolean, interaction: Interaction | undefined}> {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const body = await request.text();

	const isValidRequest =
		signature &&
		timestamp &&
		(await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
	if (!isValidRequest) {
		return { isValid: false, interaction: undefined };
	}

	return { interaction: JSON.parse(body), isValid: true };
}

export default {
	async fetch(request: Request, env: Env, _ctx): Promise<Response> {
		const url = new URL(request.url)
		if (url.pathname === '/' && request.method === "GET") return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);

		if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

		const { isValid, interaction } = await verifyDiscordRequest(request, env);
		if (!isValid || !interaction) return new Response('Bad request signature', { status: 401 });

		switch (interaction.type) {
			case InteractionType.PING: return new JsonResponse({ type: InteractionResponseType.PONG })
			case InteractionType.APPLICATION_COMMAND: {
				switch (interaction.data?.name.toLowerCase()) {
					case PERSON_COMMAND.name.toLowerCase() : {
						return new JsonResponse({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								embeds: [
									{
										title: 'This person does not exist',
										image: {url: `https://thispersondoesnotexist.com?nocache=${Date.now()}`},
										color: 0x00ff00,
									},
								],
								flags: InteractionResponseFlags.EPHEMERAL,
							}
						})
					}
					case INVITE_COMMAND.name.toLowerCase(): {
						const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_APPLICATION_ID}&scope=applications.commands`;
						return new JsonResponse({
							type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
							data: {
								content: INVITE_URL,
								flags: InteractionResponseFlags.EPHEMERAL,
							},
						});
					}
					default: return new Response('Unknown type', { status: 400 });
				}
			}
			default: return new Response('Unknown type', { status: 400 });
		}
	},
} satisfies ExportedHandler<Env>;
