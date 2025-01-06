export async function DoesPathReturnImg(path)
{
    try
    {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    }
    catch (error) {return false;}
}

export async function fetchFileList(FolderPath) {
    try {
        const response = await fetch(FolderPath);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json()

    } catch (error) {
        console.error('Error fetching file list:', error);
    }
}

export async function generateHash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('MD5', data); // Create MD5 hash
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // Convert bytes to hex
    return hashHex;
}

export async function getDailyHash()
{
    const today = new Date().toISOString().split('T')[0];
    return await generateHash(today);
}

export function hexToDecimal(hex) {
    return parseInt(hex, 16);
}

export async function getDailyInteger()
{
    return hexToDecimal(getDailyHash());
}

export async function getDailyRandomIndex(array)
{
    if (!Array.isArray(array))
    {
        console.error("array wasnt and array")
        return 0;
    }
    return hexToDecimal(getDailyHash()) % array.length;
}