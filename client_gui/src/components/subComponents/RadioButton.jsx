import RadioButtonIcon from "../icons/RadioButtonIcon";

export const RadioButton = (props) => {
    const value = props.value;
    const getter = props.getter;
    const setter = props.setter;
    const id = props.id;
    const color = props.color;
    const label = props.label;
    return (
        <div className="inline-flex items-center">
            <label className="relative flex cursor-pointer items-center rounded-full p-3"
                htmlFor={id} data-ripple-dark="true">
                <input
                    id={id}
                    type="radio"
                    value={value}
                    checked={getter === value}
                    onChange={(e) => setter(e.target.value)}
                    className={`before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-${color}-gray-200 text-pink-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-${color}-gray-500 before:opacity-0 before:transition-opacity checked:border-${color}-500 checked:before:bg-${color}-500 hover:before:opacity-10`}
                    />
                <div className={`pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-${color}-500 opacity-0 transition-opacity peer-checked:opacity-100`}>
                    <RadioButtonIcon />
                </div>
            </label>
            <label className="text-sm text-gray-400 me-4" htmlFor="profile-radio-public">
                {label}
            </label>
        </div>
    )
}