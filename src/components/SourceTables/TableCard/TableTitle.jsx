
export default function Title({word, substring}) {
    if (word.includes(substring)) {
        const beginning = word.slice(0, word.indexOf(substring));
        const end = word.slice(word.indexOf(substring) + substring.length);
        return (
            <>
                {beginning}<span className="underline decoration-dotted decoration-indigo-500">{substring}</span>{end}
            </>
        )
    } else {
        return <>{word}</>;
    }
}