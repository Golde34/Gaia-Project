import React, { useState, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Card, Title } from '@tremor/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { useCreateNoteDispatch } from '../../kernels/utils/write-dialog-api-requests';

export const CreateNewNote = () => {
    let [isOpen, setIsOpen] = useState(false);

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    const [note] = useState({});
    const [newName, setNewName] = useState('');
    const [newContent, setNewContent] = useState('');

    const createNewNote = useCreateNoteDispatch();
    const setObjectNote = (name, contentFile) => {
        note.name = name;
        note.contentFile = contentFile;
        createNewNote(note);
        window.location.reload();
    };

    const saveContentAsFile = (content) => {
        console.log("Raw Content from Quill:", content);

        let plainTextContent = content
            .replace(/^<p>/, '')
            .replace(/<\/p>$/, '')
            .replace(/<p><br><\/p>/g, '')
            .replace(/<\/p>\s*<p>/g, '\n')
            .replace(/<br>/g, '\n');

        // Decode HTML entities
        const textarea = document.createElement("textarea");
        textarea.innerHTML = plainTextContent;
        plainTextContent = textarea.value;

        console.log("Plain Text Content:", plainTextContent);

        const blob = new Blob([plainTextContent], { type: 'text/plain' });
        const file = new File([blob], `${newName}.txt`, { type: 'text/plain' });

        console.log("Created File:", file);
        return file;
    };

    return (
        <>
            <Card className="w-xs h-72 flex flex-col justify-center items-center border-dashed border-2 border-sky-500 hover:border-solid hover:cursor-pointer text-center font-bold"
                onClick={openModal}>
                <Title>Create New Note</Title>
            </Card>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-[50%] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <DialogTitle
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Create New Note
                                    </DialogTitle>
                                    {/* Note Title Input */}
                                    <div className="mt-2">
                                        <input
                                            id="note-title"
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Note Name"
                                        />
                                    </div>

                                    {/* Quill Editor */}
                                    <div className="mt-4 mb-12">
                                        <ReactQuill
                                            theme="snow"
                                            value={newContent}
                                            onChange={setNewContent}
                                            modules={modules}
                                            formats={formats}
                                            className="h-72"
                                        />
                                    </div>

                                    <div className="mt-12 flex justify-end">
                                        <button onClick={() => {
                                            setNewName('');
                                            setNewContent('');
                                            closeModal();
                                        }}
                                            className="bg-yellow-200 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:text-gray-700 transition duration-300 ease-in-out me-2">
                                            Discard
                                        </button>

                                        <button
                                            onClick={() => {
                                                const file = saveContentAsFile(newContent);
                                                setObjectNote(newName, file);
                                                closeModal();
                                            }}
                                            className="ms-2 bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-500 transition duration-300 ease-in-out"
                                        >
                                            Save Note
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

// Quill modules configuration
const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'], // remove formatting button
    ]
};

// Supported formats for Quill editor
const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image'
];

export default CreateNewNote;
