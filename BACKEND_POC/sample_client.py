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

def main():
    my_pid = os.getpid()
    credentials = pika.PlainCredentials('user', 'password')
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='127.0.0.1', credentials=credentials))
    channel = connection.channel()

    # Identify the exchanges being read
    channel.exchange_declare(exchange='CONSTELLATION.Schema', exchange_type='fanout', durable=True)
    channel.exchange_declare(exchange='CONSTELLATION.Graph', exchange_type='fanout', durable=True)
    channel.exchange_declare(exchange='CONSTELLATION.GraphAttribDefGraph', exchange_type='fanout', durable=True)
    channel.exchange_declare(exchange='CONSTELLATION.GraphAttribDefVertex', exchange_type='fanout', durable=True)
    channel.exchange_declare(exchange='CONSTELLATION.GraphAttribDefTrans', exchange_type='fanout', durable=True)
    channel.exchange_declare(exchange='CONSTELLATION.Vertex', exchange_type='fanout', durable=True)
    channel.exchange_declare(exchange='CONSTELLATION.Transaction', exchange_type='fanout', durable=True)

    # Create and bind unique queues within exchanges of interest
    result_schema = channel.queue_declare(queue='client.' + str(my_pid) + '.Schema', exclusive=False,
                                          durable=True, arguments={'x-message-ttl':600000})
    result_graph = channel.queue_declare(queue='client.' + str(my_pid) + '.Graph', exclusive=False,
                                         durable=True, arguments={'x-message-ttl':600000})
    result_graph_attrib_def_graph = channel.queue_declare(queue='client.' + str(my_pid) + '.GraphAttribDefGraph',
                                                          exclusive=False, durable=True,
                                                          arguments={'x-message-ttl':600000})
    result_graph_attrib_def_vertex = channel.queue_declare(queue='client.' + str(my_pid) + '.GraphAttribDefVertex',
                                                           exclusive=False, durable=True,
                                                           arguments={'x-message-ttl':600000})
    result_graph_attrib_def_transaction = channel.queue_declare(queue='client.' + str(my_pid) + '.GraphAttribDefTrans',
                                                                exclusive=False, durable=True,
                                                                arguments={'x-message-ttl':600000})
    result_vertex = channel.queue_declare(queue='client.' + str(my_pid) + '.Vertex', exclusive=False,
                                          durable=True, arguments={'x-message-ttl':600000})
    result_transaction = channel.queue_declare(queue='client.' + str(my_pid) + '.Transaction',
                                               exclusive=False, durable=True,
                                               arguments={'x-message-ttl':600000})

    channel.queue_bind(exchange='CONSTELLATION.Schema', queue=result_schema.method.queue)
    channel.queue_bind(exchange='CONSTELLATION.Graph', queue=result_graph.method.queue)
    channel.queue_bind(exchange='CONSTELLATION.GraphAttribDefGraph', queue=result_graph_attrib_def_graph.method.queue)
    channel.queue_bind(exchange='CONSTELLATION.GraphAttribDefVertex', queue=result_graph_attrib_def_vertex.method.queue)
    channel.queue_bind(exchange='CONSTELLATION.GraphAttribDefTrans', queue=result_graph_attrib_def_transaction.method.queue)
    channel.queue_bind(exchange='CONSTELLATION.Vertex', queue=result_vertex.method.queue)
    channel.queue_bind(exchange='CONSTELLATION.Transaction', queue=result_transaction.method.queue)

    # Simple callbacks to echo results of entires popped off of the subscribed
    # queues
    def callback_schema(ch, method, properties, body):
        print("SCHEMA                  : [x] %r" % body.decode())

    def callback_graph(ch, method, properties, body):
        print("GRAPH                   : [x] %r" % body.decode())

    def callback_graph_attrib_def_graph(ch, method, properties, body):
        print("GRAPH_ATTRIB_DEF_GRAPH  : [x] %r" % body.decode())

    def callback_graph_attrib_def_vertex(ch, method, properties, body):
        print("GRAPH_ATTRIB_DEF_VERTEX : [x] %r" % body.decode())

    def callback_graph_attrib_def_transaction(ch, method, properties, body):
        print("GRAPH_ATTRIB_DEF_TRANS  : [x] %r" % body.decode())

    def callback_vertex(ch, method, properties, body):
        print("VERTEX                  : [x] %r" % body.decode())

    def callback_transaction(ch, method, properties, body):
        print("TRANSACTION             : [x] %r" % body.decode())

    print(' [*] Waiting for logs. To exit press CTRL+C')

    # Launch main processing
    channel.basic_consume(queue=result_schema.method.queue, on_message_callback=callback_schema, auto_ack=True)
    channel.basic_consume(queue=result_graph.method.queue, on_message_callback=callback_graph, auto_ack=True)
    channel.basic_consume(queue=result_graph_attrib_def_graph.method.queue,
                          on_message_callback=callback_graph_attrib_def_graph, auto_ack=True)
    channel.basic_consume(queue=result_graph_attrib_def_vertex.method.queue,
                          on_message_callback=callback_graph_attrib_def_vertex, auto_ack=True)
    channel.basic_consume(queue=result_graph_attrib_def_transaction.method.queue,
                          on_message_callback=callback_graph_attrib_def_transaction, auto_ack=True)
    channel.basic_consume(queue=result_vertex.method.queue, on_message_callback=callback_vertex, auto_ack=True)
    channel.basic_consume(queue=result_transaction.method.queue, on_message_callback=callback_transaction, auto_ack=True)
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
