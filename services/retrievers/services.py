from llama_index.node_parser import SimpleNodeParser
from llama_index.vector_stores import PineconeVectorStore
from llama_index import GPTVectorStoreIndex, StorageContext, ServiceContext
from llama_index.embeddings.openai import OpenAIEmbedding
import pinecone
from llama_index import Document, SimpleDirectoryReader, download_loader
from llama_index.query_engine import RetrieverQueryEngine




def embed_data(data:str):

    #load data
    docs = SimpleDirectoryReader(data).load_data()

    #Parsers 
    parser = SimpleNodeParser()
    nodes = parser.get_nodes_from_documents(docs)

    # initialize connection to pinecone
    pinecone.init(
        api_key=""
            , environment=""
    )


    # create the index if it does not exist already
    index_name = 'llama-index-intro'
    if index_name not in pinecone.list_indexes():
        pinecone.create_index(
            index_name,
            dimension=1536,
            metric='cosine'
        )

    #connect to the index
    pinecone_index = pinecone.Index(index_name)

    #store the data
    vector_store = PineconeVectorStore(pinecone_index=pinecone_index)

    # setup our storage (vector db)
    storage_context = StorageContext.from_defaults(
        vector_store=vector_store
    )
    # setup the index/query process, ie the embedding model (and completion if used)
    embed_model = OpenAIEmbedding(model='text-embedding-ada-002', embed_batch_size=100)
    service_context = ServiceContext.from_defaults(embed_model=embed_model)

    index = GPTVectorStoreIndex.from_documents(
        docs, storage_context=storage_context,
        service_context=service_context
    )
    #pinecone.delete_index(index_name)
    return index


def retrieve_query(prompt, index):
    #query
    query_engine = index.as_query_engine()
    res = query_engine.query(prompt)
    #embedding = str(res.get_formatted_sources())
    #output = res+"\n" + embedding
    return str(res)


