import {
    readDocs,
    createDoc
} from "./dbCRUD"

import { isDeepEqual } from "../utils/utils"

const getAdminDocsFromCollection = (admin, collection) => {
    return new Promise(async (resolve, reject) => {
        try {
            // step1 create an empty array that would be filled with all games added by this admin
            const adminGames = []
            // step2 get all documents in the given collection
            const allGames = await readDocs(collection)
            // step3 filter these documents by the "admin" field 
            // and add the ones that belong to this admin to the array
            allGames.forEach(game => {
                if (game["adminEmail"] === admin["email"]) adminGames.push(game)
            })

            // finally return the array
            resolve(adminGames)
        } catch (error) {
            reject(error)
        }
    })
}


const doesDocBelongToAdmin = (docId, admin) => {
    return (admin["projectsIds"]["codesters"].includes(docId)) || (admin["projectsIds"]["scratch"].includes(docId))
}


const updateAdminProjectsFields = admin => {
    return new Promise(async (resolve, reject) => {
        let updatedAdmin = { ...admin } // cloning the original admin using s spread operator
        try {
            const adminScratchGamesArr = await getAdminDocsFromCollection(admin, "scratch")
            const adminCodestersGamesArr = await getAdminDocsFromCollection(admin, "codesters")
            // make sure that all docs id from codesters and scratch collection 
            // are added to the admin

            adminScratchGamesArr.forEach(game => {
                if ((game["adminEmail"] === updatedAdmin["email"]) && (!updatedAdmin["projectsIds"]["scratch"].includes(game["id"])))
                    updatedAdmin["projectsIds"]["scratch"].push(game["id"])
            })
            adminCodestersGamesArr.forEach(game => {
                if ((game["adminEmail"] === updatedAdmin["email"]) && (!updatedAdmin["projectsIds"]["codesters"].includes(game["id"])))
                    updatedAdmin["projectsIds"]["codesters"].push(game["id"])
            })
            // also keep in mind that
            // if a doc got deleted (from codesters or scratch collections)
            // make sure to remove it from the admin document as well.            
            updatedAdmin["projectsIds"]["codesters"].forEach(adminCodestersDocId => {
                const found = adminCodestersGamesArr.find(codestersDoc => codestersDoc["id"] === adminCodestersDocId);
                if (found === undefined) {
                    const docIndexToBeRemoved = updatedAdmin["projectsIds"]["codesters"].indexOf(adminCodestersDocId)
                    updatedAdmin["projectsIds"]["codesters"].splice(docIndexToBeRemoved, 1); // remove that document using the splice method
                }
            })
            updatedAdmin["projectsIds"]["scratch"].forEach(adminScratchDocId => {
                const found = adminScratchGamesArr.find(scratchDoc => scratchDoc["id"] === adminScratchDocId);
                if (found === undefined) {
                    const docIndexToBeRemoved = updatedAdmin["projectsIds"]["scratch"].indexOf(adminScratchDocId)
                    updatedAdmin["projectsIds"]["scratch"].splice(docIndexToBeRemoved, 1); // remove that document using the splice method
                }
            })
            // update the numberOfProjects field as well
            updatedAdmin["numberOfProjects"] = updatedAdmin["projectsIds"]["scratch"].length + updatedAdmin["projectsIds"]["codesters"].length
            if (!isDeepEqual(updatedAdmin, admin))
                await createDoc("admins", updatedAdmin["email"], updatedAdmin)
            // finally return the updatedAdmin
            resolve(updatedAdmin)
        } catch (error) {
            reject(error)
        }
    })
}


/**
 * check if a document exists in the database or not
 * @param {string} collectionName name of the collection where the document is stored.
 * @param {*} docId id of the document that will be checked.It can be number as well as string depending on the collection.
 * @returns {promise} searched document as an object if id exists in db, else false or error.
 * @author Khaled Badran (Programming Gym) <gym4programming@gmail.com>
 */
const isDocInDb = async docId => {
    try {
        let foundDoc = {}
        const scratchDocsArr = await readDocs("scratch")
        const codestersDocArr = await readDocs("codesters")
        const allDocsArr = [...scratchDocsArr, ...codestersDocArr] // spread operator to concat arrays
        for (const [index, docObj] of allDocsArr.entries()) {
            if (docObj["id"].toString() === docId.toString()) {
                foundDoc = {...docObj};
                // {...obj} this is called javascript spread operator
                // it is used for deep copying/cloning
                return foundDoc 
            }
            // if we reached the last element/document of the array/db and the document isn't found
            // that means this required document doesn't exist in db 
            else if (index === allDocsArr.length - 1 && docObj["id"] !== docId)
                return false
        }
    } catch (error) {
        return false
    }
}

export {
    getAdminDocsFromCollection,
    updateAdminProjectsFields,
    isDocInDb,
    doesDocBelongToAdmin
}