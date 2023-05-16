/**
 * Refreshes messages shown in chat box
 * @param {*} setMessages Method to set state of the messages property
 * @param {*} setChatBoxError Method to set the state of the chatBoxError property
 * @param {*} setChatBoxErrorMessage Method to set the state of the chatBoxErrorMessage property
 * @returns The messages in an array.
 */
export async function RefreshMessages(setMessages, setChatBoxError, setChatBoxErrorMessage) {
    const response = await fetch("http://localhost:1339/messages/", {method: "GET"});
    const result = await response.json();
    if(response.status == 200) {
        setMessages(result);
        return result;
    }
    else {
        setChatBoxError(true);
        setChatBoxErrorMessage(result.errorMessage);
    }


}