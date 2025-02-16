import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "ct_service_configuration",
})
export default class CTServiceConfigurationEntity extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        field: "id",
    })
    id!: string;

    @Column({
        type: DataType.STRING(100),
        field: "param_type",
    })
    paramType!: string;

    @Column({
        type: DataType.STRING(100),
        field: "param_name",
    })
    paramName!: string;

    @Column({
        type: DataType.STRING(1000),
        field: "param_value",
    })
    paramValue!: string;

    @Column({
        type: DataType.STRING(1000),
        field: "description",
    })
    description!: string;

    @Column({
        type: DataType.STRING(100),
        field: "entity",
    })
    entity!: string;

    @Column({
        type: DataType.BOOLEAN,
        field: "status",
    })
    status!: boolean;

    @Column({
        type: DataType.DATE,
        field: "created_at",
    })
    createdAt?: Date;

    @Column({
        type: DataType.DATE,
        field: "updated_at",
    })
    updatedAt?: Date;
}