import {Transcribed} from "./components/RecButton/RecButton"
export async function scoreText(topic, question){
    // console.log(Transcribed)
    var answer = Transcribed.text
    var duration = Transcribed.duration
    var words = Transcribed.words
    
    var scores = [];
    // console.log("SCORING:", answer, duration)
    scores.push(scoreSpeed(answer, duration));
    scores.push(scorePauses(words, duration));
    scores.push(scoreFiller(words));

    return await scoreFeedback(topic, question, answer).then(resp => {
        let x = resp.body.generations[0].text.replace("Question:", "")
        // console.log("Model Feedback:", x)
        scores.push((1.0, x))
        return scores
    })
}

function scoreSpeed(answer, transcript_duration){
    
    let n_words = answer.split(' ').length;
    let minutes = transcript_duration/60.0
    let wpm = Math.round(n_words/minutes)
    //console.log("WPM:", wpm)
    if (wpm < 105){
        return (0.0+ Math.random()/10, `You are speaking too slow. You spoke at ${wpm} words per minute. You want to speak from 125-165 words per minute.`)
    }
    else if (wpm < 125){
        return (0.4+ Math.random()/5, `You are speaking a little too slow. You spoke at ${wpm} words per minute. You want to speak from 125-165 words per minute.`)
    }
    else if (wpm < 165){
        return (1.0, `You spoke at a good pace! Great work.`)
    }
    else if (wpm < 185){
        return (0.4+ Math.random()/5, `You are speaking a little too fast. You spoke at ${wpm} words per minute. You want to speak from 125-165 words per minute.`)
    }
    else{
        return (0.0+ Math.random()/10, `You are speaking too fast. You spoke at ${wpm} words per minute. You want to speak from 125-165 words per minute.`)
    }
}

async function scoreFeedback(topic, question, answer){
    const cohere = require('cohere-ai');
    
    let prompt = `Candidate is reviewing his recent interview with this candidate for a ${topic} position and he is providing useful feedback to the candidate.
        A good response to a question should fully answer all parts of the question, it should be specific and on-topic, it should highlight potential experiences, and it should show how the candidate is a good fit for the position.
        A bad response might have bad grammer, not respond to the question, make the candidate seem like a poor fit, or not highlight the candidate's experience. 

        Provide useful feedback to each candidate's response to Eric's question.
        Question: "What is overfitting? How can you prevent it?"
        Reponse: "Overfitting is when training some predictive model we find that the accuracy on the training set is significantly higher than the test set. This can occur for many reasons, a popular one is a model being overparameterized. We can understand overfitting as the model learning specific, non-relevant patterns in the training data that lead to poor generalization. Some approaches to prevent it include regularization, collecting more diverse data, or reducting the model's capacity."
        Feedback: This is a great response. This response shows a deep understanding of the mechanism of overfitting and includes potential solutions to mitigate the problem. The answer is well-worded and thorough in its response.

        Question: "${question}"
        Response: "${answer}"
        Feedback:`


        const response_p = await cohere.generate('large', {
            prompt: prompt,
            max_tokens: 120,
            temperature: 0.6,
            p: 0.5,
            stop_sequences: ['Question:']
        })
        
        //console.log(response_p);
        return response_p
        
}


function scorePauses(words, transcript_duration){
    let pauses = 0;
    let pause_time = 0;
    for (let index = 1; index < words.length; ++index) {
        const word = words[index];
        const last_word = words[index-1];
        let pause = word.start - last_word.end 
        if (pause > 2000){
            pauses = pauses + 1;
            pause_time = pause_time + pause / 1000; 
        } // 2s
    }
    
    let perc_talking = 1 - (pause_time)/(transcript_duration)
    //log("Pause Score:", perc_talking)
    if (perc_talking < .6){
        return (0.0 + Math.random()/5, `You had much too many pauses. We detected that ${Math.round(100*(pause_time)/(transcript_duration))}% of your time was with long pauses.`)
    }
    else if (perc_talking < .75){
        return (0.33+ Math.random()/3, `You had too many pauses. We detected that ${Math.round(100*(pause_time)/(transcript_duration))}% of your time was with long pauses.`)
    }
    else if (perc_talking < .90){
        return (perc_talking, `You a good number of pauses. We detected that ${Math.round(100*(pause_time)/(transcript_duration))}% of your time was with long pauses.`)
    }
    else{
        return (0.67+ Math.random()/6, `You had almost no pauses. Please note that it can be helpful to use pauses to prevent monotonous speech.`)
    } 
}

function scoreFiller(words){
    let filler_words = ["um",    "uh",   "hmm",    "mhm",    "uh huh"];
    let filler_cnt = 0;
    for (let index = 0; index < words.length; ++index) {
        const word = words[index];
        let text = word.text;
        if (filler_words.includes(text)){
            filler_cnt = filler_cnt + 1;
        } 
    }
    let perc_filler = 1 - filler_cnt/words.length
    //console.log("Percent Non-Filler Words:", perc_filler)
    if (perc_filler < .75){
        return (0.0+Math.random()/5, `You had too many filler words (like um, uh, and hmm). We found ${filler_cnt} different times!`)
    }
    if (perc_filler < .85){
        return (0.4 + Math.random()/5, `You had a few too many filler words (like um, uh, and hmm). We found ${filler_cnt} different times!`)
    }
    else{
        return (perc_filler, `You had almost no filler words! Great job!`)
    }
}
