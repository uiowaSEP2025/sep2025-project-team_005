from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data = text_data.strip()
        text_data = text_data.replace('\\"', '"').strip('"')
        data = json.loads(text_data)
        message_type = data.get('type')
        print(message_type)

        if message_type == 'chat_message':
            message_object = data.get('message_object')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_object': message_object,
                }
            )
        elif message_type == 'typing':
            username = data['username']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing',
                    'username': username
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message_object': event['message_object'],
        }))

    async def typing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'username': event['username']
        }))
