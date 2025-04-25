import { useDispatch, useSelector } from "react-redux"
import Template from "../../components/template/Template"
import { useNavigate, useParams } from "react-router-dom";
import { getNoteById } from "../../api/store/actions/task_manager/note.actions";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Flex, Metric, Text, Title } from "@tremor/react";
import MessageBox from "../../components/subComponents/MessageBox";
import ReactQuill from 'react-quill';
import { Input } from "@material-tailwind/react";
import { useUpdateNoteDispatch } from "../../kernels/utils/dialog-api-requests";
import { saveContentAsFile } from "../../kernels/utils/display-file-handler";
import { isAccessTokenCookieValid } from "../../kernels/utils/cookie-utils";

function ContentArea() {
    const dispatch = useDispatch();

    const noteId = useParams().id;
    const noteDetail = useSelector((state) => state.noteDetail);
    const { loading, error, note } = noteDetail;

    const getNote = useCallback(() => {
        dispatch(getNoteById(noteId));
    }, [dispatch, noteId]);

    const debouceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debouceRef.current);
        debouceRef.current = setTimeout(() => {
            getNote();
        }, 200);
    }, [noteId]);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [noteName, setNoteName] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteForm] = useState({});

    const updateNote = useUpdateNoteDispatch();
    const setObjectNote = (name, content) => {
        noteForm.noteId = noteId;
        noteForm.name = name;
        noteForm.contentFile = content;
        updateNote(noteForm);
        window.location.reload();
    }

    const setObjectNoteNone = () => {
        setNoteName('');
        setNoteContent('');
    }

    return (
        <div>
            {loading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <MessageBox message={error} />
            ) : (
                <>
                    <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                        className="text-2xl font-bold text-gray-800">Note Detail
                    </Metric>
                    <Card
                        className={`transition-all duration-300 ease-in-out border-2 border-blue-500 "h-72 p-6"
                  flex flex-col justify-center items-center text-center cursor-pointer`}
                    >
                        {isEditingTitle ? (
                            <Input
                                type="text"
                                className="p-2 w-full text-lg font-bold text-white"
                                value={noteName}
                                onChange={(e) => { setNoteName(e.target.value) }}
                                onBlur={() => { setIsEditingTitle(!isEditingTitle) }}
                                autoFocus
                            />
                        ) : (
                            <Title
                                className="text-lg cursor-pointer font-bold mb-2 text-white"
                                onClick={() => { setIsEditingTitle(!isEditingTitle) }}
                            >
                                {noteName ? noteName : note.name}
                            </Title>
                        )}

                        <div className="w-full max-w-7xl mt-4">
                            <ReactQuill
                                value={noteContent ? noteContent : note.fileContent}
                                theme="snow"
                                modules={modules}
                                formats={formats}
                                className="bg-gray-100 p-4 rounded-lg h-auto w-90"
                                onChange={(value) => { setNoteContent(value) }}
                            />
                        </div>
                        <Flex className="mt-4" justifyContent="end">
                            <button
                                type="button"
                                className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                onClick={() => {
                                    setObjectNoteNone()
                                }}
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                onClick={() => {
                                    const file = saveContentAsFile(noteContent, noteName ? noteName : note.name);
                                    setObjectNote(noteName, file);
                                }}
                            >
                                Save
                            </button>
                        </Flex>
                    </Card>
                    <a href="/client-gui/note-dashboard" className="flex justify-end">
                        <Button className="mt-5">Back</Button>
                    </a>
                </>
            )
            }
        </div>
    )
}

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
    ]
};

const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image'
];

const NoteDetail = () => {
    const navigate = useNavigate();
    const isUserValid = isAccessTokenCookieValid();
    useEffect(() => {
        if (isUserValid) {
            navigate('/signin');
        }
    }, [isUserValid, navigate]);
    return (
        <Template>
            <ContentArea />
        </Template>
    )
}

export default NoteDetail;