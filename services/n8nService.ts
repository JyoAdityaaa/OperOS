
export interface N8NResponse {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * Service to interact with n8n webhooks for resume analysis automation.
 * This triggers a workflow that processes the file via AI externally.
 */
export const analyzeResumeWithN8N = async (file: File, jobDescription: string, candidateEmail: string): Promise<N8NResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobDescription', jobDescription);
    formData.append('candidateEmail', candidateEmail);

    // Use AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

    try {
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

        if (!webhookUrl) {
            console.warn("VITE_N8N_WEBHOOK_URL is not defined in environment variables.");
            return { success: false, error: 'Automation unavailable' };
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            // Log status for debugging but return safe error to user
            console.error(`n8n Webhook failed with status: ${response.status}`);
            return { success: false, error: 'Automation unavailable' };
        }

        const result = await response.json();
        return { success: true, data: result };

    } catch (error) {
        clearTimeout(timeoutId);

        // Log actual error for developer but return safe default
        console.error("n8n Service Error:", error);
        return { success: false, error: 'Automation unavailable' };
    }
}
