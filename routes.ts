import { RouterContext } from "https://deno.land/x/oak/mod.ts";
import db from './mongodb.ts';

// using collection notes
const notesCollection = db.collection('notes');

// GET for all the notes
const getNotes = async (ctx: RouterContext) => {
    // db query
    const notes = await notesCollection.find();
    // send res with 200 status
    ctx.response.status = 200;
    ctx.response.body = notes;
}

// GET for single note
const getSingleNote = async (ctx: RouterContext) => {
    const id = ctx.params.id;
    // db query 
    const note = await notesCollection.findOne({ _id: { $oid: id } });
    // send res with 200 status
    ctx.response.status = 200;
    ctx.response.body = note;
}

// POST for creating note
const createNote = async (ctx: RouterContext) => {
    const {value: {title, body}} = await ctx.request.body();
    // interface can be created to make it more appropriate
    const note: any = {
        title,
        body,
        date: new Date(),
    };
    // db query to inset return id as json
    const id = await notesCollection.insertOne(note);
    // adding id in note
    note._id = id;
    // res with status code
    ctx.response.status = 201;
    ctx.response.body = note;
}

// PUT for updating a note
const updateNote = async (ctx: RouterContext) => {
    const id = ctx.params.id;
    // Get title and body from request
    const { value: {title, body} } = await ctx.request.body();
    // db query to update
    const { matchedCount, modifiedCount, upsertedId } = await notesCollection.updateOne(
        { _id: {$oid: id}},
        {
            $set: {
                title,
                body,
            },
        },
    );
    if (!modifiedCount) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Note does not exist" };
        return;
      }
    // return the updated note
    ctx.response.body = await notesCollection.findOne({ _id: { $oid: id } });
}

// DELETE for deleting note from db
const deleteNote = async (ctx: RouterContext) => {
    const id = ctx.params.id;
    // db query
    const deleteCount = await notesCollection.deleteOne({ _id: { $oid: id } });
    if (!deleteCount) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Note does not exist" };
        return;
    }
    ctx.response.status = 204;
}

export {getNotes, createNote, deleteNote, updateNote, getSingleNote};