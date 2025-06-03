import { Button, Card, TextInput } from "@tremor/react"
import { useState } from "react"

const GaiaIntroduction = ({ onNext, onSkip }) => {
    const [input, setInput] = useState("")
    const suggestions = [
        "What is Gaia?",
        "What features does Gaia offer?",
        "Why should I use Gaia?"
    ]

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: Call API to process the input
        console.log("Processing input:", input)
        setInput("")
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div className="w-full max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-4">Welcome to Gaia</h1>
                    <p className="text-lg text-gray-600 mb-4">
                        Gaia is your intelligent virtual assistant, specializing in task management and work optimization.
                        I can help you manage tasks, schedule appointments, and provide valuable suggestions
                        to enhance your productivity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {suggestions.map((suggestion, index) => (
                        <Card key={index} className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => setInput(suggestion)}>
                            <p className="text-gray-700">{suggestion}</p>
                        </Card>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex gap-4">
                        <TextInput
                            placeholder="Type your question here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" variant="primary">Send</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default GaiaIntroduction;
