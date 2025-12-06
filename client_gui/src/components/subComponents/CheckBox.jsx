import CheckBoxIcon from "../icons/CheckboxIcon"

export const CheckBoxComponent = (props) => {
    const getter = props.getter;
    const setter = props.setter;
    const id = props.id;
    const color = props.color;
    const label = props.label;
    const textLight = props.textLight === undefined ? 700 : props.textLight;
    return (
        <div className="inline-flex items-center">
            <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                htmlFor={id} data-ripple-dark="true">
                <input
                    id={id}
                    type="checkbox"
                    checked={getter}
                    onChange={() => setter(!getter)}
                    className={`before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-${color}-gray-500 before:opacity-0 before:transition-opacity checked:border-${color}-500 checked:bg-${color}-500 checked:before:bg-${color}-500 hover:before:opacity-10`}
                />
                <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                    <CheckBoxIcon />
                </div>
            </label>
            <label className={`text-sm text-gray-${textLight}`}>{label}</label>
        </div>
    )
}