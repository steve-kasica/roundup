
export default function HighlightText({pattern, text}) {
    const haystack = String(text).toLowerCase();
    const needle = pattern.toLowerCase();

    if (!haystack.includes(needle)) {
        return <>{text}</>
    } else {
        // There is a match
        const [start, stop] = [haystack.indexOf(needle), haystack.indexOf(needle) + needle.length];
        const beginning = text.slice(0, start);
        const middle = text.slice(start, stop)
        const end = text.slice(stop);

        return (
            <>
                {beginning}
                <span className="bg-yellow-100">{middle}</span>
                {end}
            </>);
    }
}