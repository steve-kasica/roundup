
export default function HighlightText({pattern, text}) {
    text = String(text);
    const haystack = text.toLowerCase();
    const needle = pattern.toLowerCase();

    if (!haystack.includes(needle)) {
        return <>{text}</>
    } else {
        // There is a match on the first occurence
        const start = haystack.indexOf(needle);
        const stop = start + needle.length;

        const beginning = text.slice(0, start);
        const middle = text.slice(start, stop)
        const end = text.slice(stop);

        return <>{beginning}<span className="highlight">{middle}</span>{end}</>;
    }
}