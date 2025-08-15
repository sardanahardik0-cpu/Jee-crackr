import React, { useEffect, useState } from "react";
import axios from "axios";

function MockTest() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://opentdb.com/api.php?amount=5&category=19&type=multiple")
      .then(res => {
        setQuestions(res.data.results);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <p>Loading questions...</p>;

  return (
    <div>
      <h2>Mock Test</h2>
      {questions.map((q, index) => (
        <div key={index} className="question">
          <p dangerouslySetInnerHTML={{ __html: q.question }} />
        </div>
      ))}
    </div>
  );
}

export default MockTest;
