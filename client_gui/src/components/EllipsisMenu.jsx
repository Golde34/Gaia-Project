import { Button, Menu, MenuHandler, MenuList } from "@material-tailwind/react";
import EllipsisIcon from "./icons/EllipsisIcon";
import { InputNameDialog } from "./subComponents/InputNameDialog";
import { AlertDialog } from "../components/subComponents/AlertDialog";
import { ColorDialog } from "../components/subComponents/ColorDialog";
import { LockDialog } from "./subComponents/LockDialog";
import { ServiceTag } from "../kernels/constants/constants";

const EllipsisMenu = ({ elementName, elementId, isLock, projectId, suggestion }) => {
    const updateTag = `Update ${elementName}`;
    const deleteTag = `Delete ${elementName}`;
    const archiveTag = `Archive ${elementName}`;
    const ordinalTag = `Push ${elementName} to the top`;
    const changeColorTag = "Change color";
    const lockTag = `${isLock ? "Unlock" : "Lock"} ${elementName}`;
    const syncProjectWithGithub = "Sync Project with Github";

    return (
        <div className="flex gap-3">
            <Menu
                placement="bottom-start"
                animate={{
                    mount: { opacity: 1, scale: 1, y: 0 },
                    unmount: { opacity: 0, scale: 0.5, y: 25 },
                }}
            >
                <MenuHandler>
                    <Button style={{ padding: 0 }}>
                        <EllipsisIcon width={60} />
                    </Button>
                </MenuHandler>
                <MenuList className="grid grid-rows-3 rounded-md bg-white">
                    {elementName !== ServiceTag.SCHEDULE_GROUP && (
                        <InputNameDialog
                            className="col-span-1"
                            component={updateTag}
                            elementName={elementName}
                            elementId={elementId}
                        />
                    )}

                    {elementName === ServiceTag.GROUP_TASK && (
                        <AlertDialog
                            className="col-span-1"
                            component={ordinalTag}
                            elementName={elementName}
                            action="push"
                            elementId={elementId}
                            projectId={projectId}
                        />
                    )}

                    {elementName === ServiceTag.NOTE && (
                        <LockDialog
                            className="col-span-1"
                            component={lockTag}
                            elementName={elementName}
                            elementId={elementId}
                            isLock={isLock}
                            suggestion={suggestion}
                        />
                    )}

                    {elementName === ServiceTag.PROJECT && (
                        <AlertDialog
                            className="col-span-1"
                            component={syncProjectWithGithub}
                            elementName={elementName}
                            action="sync"
                            elementId={elementId}
                        />
                    )}

                    <AlertDialog
                        className="col-span-1"
                        component={deleteTag}
                        elementName={elementName}
                        action="Delete"
                        elementId={elementId}
                    />

                    {elementName === ServiceTag.PROJECT && (
                        <ColorDialog
                            className="col-span-1"
                            component={changeColorTag}
                            elementName={elementName}
                            elementId={elementId}
                        />
                    )}

                    <AlertDialog
                        className="col-span-1"
                        component={archiveTag}
                        elementName={elementName}
                        action="Archive"
                        elementId={elementId}
                    />
                </MenuList>
            </Menu>
        </div>
    );
};

export default EllipsisMenu;
