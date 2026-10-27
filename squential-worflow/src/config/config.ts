interface configInterface{
    GROQ_API_KEY:string
}

const config:configInterface = {
    GROQ_API_KEY:process.env.GROQ_API_KEY || ''
}

export default config;