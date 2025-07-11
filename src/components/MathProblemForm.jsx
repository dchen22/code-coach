// src/components/MathProblemForm.jsx
import React, { useState } from 'react'
import Card from "./ui/Card.jsx"
import CardContent from "./ui/CardContent.jsx"
import Textarea from "./ui/Textarea.jsx"
import Input from "./ui/Input.jsx"
import Button from "./ui/Button.jsx"
import { motion } from 'framer-motion'

export default function MathProblemForm() {
  const [latex, setLatex] = useState('')
  const [file, setFile] = useState(null)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = e => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async () => {
    if (loading) return; // Prevent double submissions
    setLoading(true)
    
    try {
      const formData = new FormData();
      
      // Add text input if present
      if (latex) {
        formData.append('code', latex);
      }
      
      // Add file if present
      if (file) {
        formData.append('file', file);
      }

      if (!formData.entries().next().value) {
        throw new Error('No input provided - please enter text or upload a file');
      }
      console.log("Form data:")
      console.log(formData)
      const res = await fetch('http://localhost:4000/api/analyze', {
        method: 'POST',
        body: formData
      })
      
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await res.json()
      console.log('API Response:', responseData)
      setResponse(responseData)
    } catch (err) {
      console.error('Error submitting math problem:', err)
      setResponse({
        success: false,
        error: 'Failed to submit math problem. Please try again later.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4">
      <CardContent>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Problem (LaTeX)</span>
            <Textarea
              value={latex}
              onChange={e => setLatex(e.target.value)}
              placeholder="Enter problem in LaTeX"
              rows={6}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Or upload image</span>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </label>

          <Button onClick={handleSubmit} disabled={loading || (!latex && !file)}>
            {loading ? 'Processing...' : 'Submit'}
          </Button>
        </div>

        {response && (
          <motion.div
            className="mt-6 p-4 bg-white rounded-lg shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {response.success ? (
              <div>
                <h2 className="text-xl font-semibold mb-2">Feedback</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Type of Problem:</h3>
                    <p>{response.type}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Hints:</h3>
                    <ul className="list-disc pl-5">
                      {response.hints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium">Common Mistakes:</h3>
                    <ul className="list-disc pl-5">
                      {response.commonMistakes.map((mistake, index) => (
                        <li key={index}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium">Related Topics:</h3>
                    <ul className="list-disc pl-5">
                      {response.relatedTopics.map((topic, index) => (
                        <li key={index}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-500">
                <h3 className="font-medium">Error:</h3>
                <p>{response.error}</p>
                {response.details && (
                  <p className="mt-1">Details: {response.details}</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
