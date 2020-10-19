"""
 *
 * Copyright 2010-2020 Australian Signals Directorate
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
"""

# A simple RabbitMQ client that acts as a consumer of updates to the set of
# CONSTELLATION.<Model Name> queues that are populated by the web-constellation
# backend Proof of Concept to demonstrate the ability of applications to
# subscribe for updates from web-constellation.
#
# Usage - 'python sample_client.py'
# when running a set of unique queues are generated based on requested data and
# current PID. These queues are red and new entries popped off of them as read.
import pika, sys, os

EXCHANGER_NAME = 'CONSTELLATION.DataUpdates'


def main():
    my_pid = os.getpid()
    credentials = pika.PlainCredentials('user', 'password')
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='127.0.0.1',
                                                                   credentials=credentials))
    channel = connection.channel()

    # Identify the exchanges being read
    channel.exchange_declare(exchange=EXCHANGER_NAME, exchange_type='fanout', durable=True)
    results = channel.queue_declare(queue='client.' + str(my_pid) + '.Schema', exclusive=False,
                                    durable=True, arguments={'x-message-ttl':600000})
    channel.queue_bind(exchange=EXCHANGER_NAME, queue=results.method.queue)

    # Simple callbacks to echo results of entries popped off of the subscribed
    # queues
    def callback_results(ch, method, properties, body):
        print("%r" % body.decode())

    print('Waiting for logs. To exit press CTRL+C')

    # Launch main processing
    channel.basic_consume(queue=results.method.queue, on_message_callback=callback_results,
                          auto_ack=True)
    channel.start_consuming()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
