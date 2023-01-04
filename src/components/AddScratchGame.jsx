import { React, useState, useCallback } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import useAxios from "../hooks/useAxios"
import { createDoc } from "../firebase/dbCRUD"

const AddScratchGame = ({ admin }) => {
    const [id, setId] = useState() // id here is number
    // fetch data from scratch api
    // [ScratchGameFields] to get the fetched data as an obj 
    // instead of an array that has one object in it
    const [ScratchGameFields] = useAxios(`/projects/${id}`) // string interpolation syntax: `..... ${var} ..`


    const handleSubmit = (e) => {
        e.preventDefault()
        const createdScratchGameObj = createScratchGameObj()
        const firestoreGameDocName = createdScratchGameObj["title"].replace(/\s+/g, '_'); // replace whitespaces with underscores 
        createDoc("scratch", firestoreGameDocName, createdScratchGameObj)
            .then(res => {
                console.log("res:", res)
            })
            .catch(error => {
                console.log("error:", error)
            })
    }

    // using arrow functions or binding in JSX is a bad practice as it hurts the performance.
    // because the function is recreated on each render.
    // to solve this issue, use the callback with the useCallback() hook,
    // and assign the dependencies to an empty array.
    const setIdCallBack = useCallback(e => setId(e.target.value),[])


    const createScratchGameObj = () => {
        // create an empty obj then fill it with the fetched data.
        const createdScratchGameObj = {}
        createdScratchGameObj["id"] = parseInt(id)
        createdScratchGameObj["description"] = ScratchGameFields["description"]
        createdScratchGameObj["image"] = ScratchGameFields["image"]
        createdScratchGameObj["instructions"] = ScratchGameFields["instructions"]
        createdScratchGameObj["title"] = ScratchGameFields["title"]
        createdScratchGameObj["author"] = {
            "profileImage": ScratchGameFields["author"]["profile"]["images"]["55x55"],
            "username": ScratchGameFields["author"]["username"]
        }
        return createdScratchGameObj
    }





    return (
        <div className="container text-white">
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">

                    <Form.Label>Game Id</Form.Label>
                    <Form.Control
                        type="Game ID"
                        placeholder="Enter id e.g. 723650095"
                        required
                        value={id}
                        onChange={setIdCallBack}
                    />

                    <Form.Text className="text-muted mt-2">
                        All the other details will be fetched automatically using Scratch REST API.
                    </Form.Text>
                </Form.Group>

                <div className="d-grid gap-2 col-6 mx-auto">
                    <Button variant="success" type="submit">
                        Submit
                    </Button>
                </div>
            </Form>
        </div>
    )
}



export default AddScratchGame
