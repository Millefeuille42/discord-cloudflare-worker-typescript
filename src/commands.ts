type Command = {
  name: string,
  description: string
}

export const PERSON_COMMAND: Command = {
  name: 'person',
  description: 'Get a picture from thispersondoesnotexist.com'
}

export const INVITE_COMMAND: Command = {
	name: 'invite',
	description: 'Get the invite link for this bot'
}
