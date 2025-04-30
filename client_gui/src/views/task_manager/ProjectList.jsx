import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProjects } from "../../api/store/actions/task_manager/project.actions";
import Template from "../../components/template/Template";
import CardButton from "../../components/subComponents/CardButton";
import { Metric } from "@tremor/react";
import { CreateNewProject } from "../../screens/projectScreen/CreateNewProject";

function ContentArea() {
    const userId = "1";
    const dispatch = useDispatch();
    
    const listProjects = useSelector((state) => state.projectList);
    const { loading, error, projects } = listProjects;

    const getListProjects = useCallback(() => {
        dispatch(getProjects(userId));
    }, [dispatch, userId]);

    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getListProjects();
        }, 200);
    }, []);

    localStorage.setItem("activeTab", 'none');

    return (
        <div>
            {loading ? (
                <p> Loading </p>
            ) : error ? (
                <p> Error </p>
            ) : (
                <>
                    <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                        className="text-2xl font-bold text-gray-800"> Projects
                    </Metric>
                    <div className="grid md:grid-cols-3 w-full h-full items-center">
                        {projects.map((project) => (
                           <div key={project.id} className="m-3">
                                <CardButton name={project.name} description={project.description} color={project.color}
                                    url={`/project/${project.id}`} buttonText="View Project" elementId={project.id}
                                />
                            </div> 
                        ))}
                        <div key={'create-project'} className="m-3 flex justify-center">
                            <CreateNewProject />
                        </div>
                    </div>

                </>
            )}
        </div>
    )
}

const ProjectList = () => {
    return (
        <Template>
            <ContentArea />
        </Template>
    )
}

export default ProjectList;