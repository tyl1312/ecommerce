const Button = ({ type, btnStyle, onClick, disabled, title, icon }) => {
    return (
        <button
            type={type}
            className={`h-12 w-full md:max-w-[150px] py-2 px-3 font-bold text-lg rounded-xl ${btnStyle}`}
            onClick={onClick}
            disabled={disabled}
        >
            {title}
            {icon}
        </button>
    );
};

export default Button;
