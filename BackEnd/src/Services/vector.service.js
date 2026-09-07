const { Pinecone } = require('@pinecone-database/pinecone')

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const projectGPTIndex = pc.Index("project-gpt");

async function createMemory({ vectors, metadata }) {

    await projectGPTIndex.upsert({
        records: [{
            id: metadata.id,
            values: vectors,
            metadata
        }]
    })
}

async function queryMemory({ queryVectors, limit = 5, metadata }) {
    const result = await projectGPTIndex.query({
        topK: limit,
        vector: queryVectors,
        filter: metadata ? metadata : undefined,
        includeMetadata: true,
        includeValues: true
    })

    return result.matches
}




module.exports = { createMemory, queryMemory }
