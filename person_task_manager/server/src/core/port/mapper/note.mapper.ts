import { isStringEmpty } from "../../../kernel/util/string-utils";
import { UpdateNoteRequestDto } from "../../domain/dtos/note.dto";
import { INoteEntity } from "../../domain/entities/note.entity";
import { ActiveStatus, EventStatus } from "../../domain/enums/enums";

export const noteMapper = {
    buildUploadFileKafkaMessage(noteId: string, fileId: string, fileName: string) {
        console.log("Build Kafka message: ", noteId, fileId, fileName);
        return {
            "noteId": noteId,
            "fileId": fileId,
            "fileName": fileName
        }
    },

    createNoteMapper(note: INoteEntity): INoteEntity {
        isStringEmpty(note.name) ? note.name = convertNewDateToName() : note.name;
        note.isLock === null ? note.isLock = false : note.isLock;
        isStringEmpty(note.activeStatus) ? note.activeStatus = ActiveStatus.active : note.activeStatus;
        note.createdAt = new Date();
        note.updatedAt = new Date();
        isStringEmpty(note.fileStatus) ? note.fileStatus = EventStatus.INIT : note.fileStatus;
        return note;
    },

    lockNoteMapper(note: INoteEntity, notePassword: string, passwordSuggestion: string): INoteEntity {
        note.isLock = true;
        note.notePassword = notePassword;
        note.passwordSuggestion = passwordSuggestion;
        return note;
    },

    unlockNoteMapper(note: INoteEntity): INoteEntity {
        note.isLock = false;
        note.notePassword = '';
        note.passwordSuggestion = '';
        return note;
    },

    updateNoteMapper(note: UpdateNoteRequestDto, oldNote: INoteEntity): INoteEntity {
        oldNote.updatedAt = new Date();
        oldNote.name = !isStringEmpty(note.name) ? note.name! : oldNote.name;
        oldNote.summaryDisplayText = !isStringEmpty(note.summaryDisplayText) ? note.summaryDisplayText! : oldNote.summaryDisplayText;
        oldNote.fileId = note.fileId;
        oldNote.fileName = note.fileName;
        oldNote.fileStatus = EventStatus.INIT
        return oldNote;
    },

    buildUploadUpdatedFileKafkaMessage(noteId: string, oldFileName: string, existedFile: INoteEntity, updatedFile: INoteEntity) {
        return {
            "noteId": noteId,
            "existedFileLocation": existedFile.fileLocation,
            "existedFileName": oldFileName,
            "fileId": updatedFile.fileId,
            "fileName": updatedFile.fileName
        }
    }
}

const convertNewDateToName = () => {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
