import { useDispatch, useSelector } from "react-redux";
import Template from "../../components/template/Template";
import { useCallback, useEffect, useRef } from "react";
import { getNoteList } from "../../api/store/actions/task_manager/note.actions";
import { Metric } from "@tremor/react";
import NoteItem from "../../components/subComponents/NoteItem";
import CreateNewNote from "../../screens/noteScreen/CreateNewNote";

function ContentArea() {
    const dispatch = useDispatch();
    // const userId = localStorage.getItem('userInfo');
    const userId = "1";

    const listNotes = useSelector(state => state.noteList);
    const { loading, error, notes } = listNotes;

    const getListNotes = useCallback(() => {
        dispatch(getNoteList(userId));
    }, [dispatch, userId]);

    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getListNotes();
        }, 200);
    }, [])

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <div className="max-w-7xl mx-auto">
                    <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                        className="text-2xl font-bold text-gray-800"> Note Dashboard
                    </Metric>
                    <div className="grid md:grid-cols-4 w-full h-full items-center">
                        {
                            notes.map((note) => (
                                <div key={note.id} className="ms-5 me-5 mt-7">
                                    <NoteItem name={note.name} isLock={note.isLock} note={note}
                                        url={`/note/${note.id}`} buttonText="View note" elementId={note.id}
                                    />
                                </div>
                            ))
                        }
                        <div key={'create-note'} className="ms-5 me-5 mt-7 flex justify-center">
                            <CreateNewNote userId={userId} />
                        </div>
                    </div>

                </div>
            )
            }
        </div>
    )
}

const NoteDashboard = () => {
    return (
        <Template>
            <ContentArea />
        </Template>
    );
}

export default NoteDashboard;