import { Button, Card, Metric, TextInput } from "@tremor/react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion" 
import { FastForwardIcon } from "@heroicons/react/outline"

const GaiaIntroduction = ({ onNext, onSkip }) => {
    const [input, setInput] = useState("")
    const [showCard, setShowCard] = useState(false) 

    const suggestions = [
        "Who are you?",
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
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center"
            >
                <Metric className="mb-4">
                    Welcome to Gaia, your virtual assistant!
                </Metric>

                <motion.div
                    animate={{ y: showCard ? 0 : 10 }}
                    transition={{ repeat: showCard ? 0 : Infinity, duration: 1, repeatType: "reverse" }}
                    className="cursor-pointer mt-4"
                    onClick={() => setShowCard(true)}
                >
                    {!showCard && (
                        <div className="flex flex-col items-center gap-2">
                            <Button variant="light">Get Started</Button>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {showCard && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Card className="p-4">
                            <div className="text-center mb-8">
                                <p className="text-lg text-gray-600 mb-4">
                                    Hello! I'm Gaia, your virtual assistant.
                                    It's my pleasure to be your companion on this new journey.
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
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
            >

            </motion.div>
        </>
    )
}

export default GaiaIntroduction;
