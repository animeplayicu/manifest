async function getShortenedURL(longURL, useSecondAPI = false) {
    try {
        const apiToken = useSecondAPI ? '4e59936e77170037ff76e1d563400e2dcbd98dc2' : API_TOKEN;
        const response = await fetch(`https://cuty.io/api?api=${apiToken}&url=${encodeURIComponent(longURL)}`);
        const data = await response.json();
        if (data.status === "success" && data.shortenedUrl) {
            return data.shortenedUrl;
        } else {
            console.error("API error:", data);
            return longURL; 
        }
    } catch (error) {
        console.error("Error fetching short link:", error);
        return longURL;
    }
}
