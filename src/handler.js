const fs = require('fs/promises');
const path = require('path');
const { nanoid } = require('nanoid');

const notesPath = path.join(__dirname, './notes.json');

const getNotes = async () => {
    const notes = await fs.readFile(notesPath, 'utf-8');
    return JSON.parse(notes);
};

const updateNotes = async (newNotes) => {
    await fs.writeFile(notesPath, JSON.stringify(newNotes, null, 4));
    return newNotes;
};

module.exports.addNoteHandler = async (request, h) => {
    const { title, tags, body } = request.payload;

    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
        title,
        tags,
        body,
        id,
        createdAt,
        updatedAt,
    };

    const notes = await getNotes();
    const updatedNotes = await updateNotes([...notes, newNote]);
    const isSuccess = updatedNotes.find((note) => note.id === id);

    if (isSuccess) {
        const res = h.response({
            status: 'success',
            message: 'catatat berhasil ditambahkan',
            data: {
                noteId: id,
            },
        });
        res.code(201);
        return res;
    }

    const res = h.response({
        status: 'fail',
        message: 'catatan gagal ditambahkan',
    });
    res.code(500);
    return res;
};

module.exports.getAllNotesHandler = async () => {
    const notes = await getNotes();
    return {
        status: 'success',
        data: {
            notes,
        },
    };
};

module.exports.getNoteByIdhandler = async (request, h) => {
    const { id } = request.params;
    const notes = await getNotes();
    const note = notes.find((n) => n.id === id);

    if (note) {
        const res = h.response({
            status: 'success',
            data: {
                note,
            },
        });
        res.code(200);
        return res;
    }

    const res = h.response({
        status: 'fail',
        message: 'Catatan tidak ditemukan',
    });
    res.code(404);
    return res;
};

module.exports.editNoteByIdHandler = async (request, h) => {
    const { id } = request.params;
    const { title, body, tags } = request.payload;
    const notes = await getNotes();

    const updatedAt = new Date().toISOString();
    const noteIdx = notes.findIndex((n) => n.id === id);

    let res;

    if (noteIdx !== -1) {
        notes[noteIdx] = {
            ...notes[noteIdx],
            title,
            body,
            tags,
            updatedAt,
        };
        await updateNotes(notes);

        res = h.response({
            status: 'success',
            message: 'Catatan berhasil diperbaharui',
        });
        res.code(200);
    } else {
        res = h.response({
            status: 'fail',
            message: 'Gagal memperbarui catatan. Id tidak ditemukan',
        });
        res.code(404);
    }

    return res;
};

module.exports.deleteNoteByIdHandler = async (request, h) => {
    const { id } = request.params;
    const notes = await getNotes();
    const noteIdx = notes.findIndex((n) => n.id === id);

    let res;

    if (noteIdx !== -1) {
        notes.splice(noteIdx, 1);
        updateNotes(notes);
        res = h.response({
            status: 'success',
            message: 'Catatan berhasil dihapus',
        });
        res.code(200);
    } else {
        res = h.response({
            status: 'fail',
            message: 'Catatan gagal dihapus. Id tidak ditemukan',
        });
        res.code(404);
    }

    return res;
};
