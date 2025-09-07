document.addEventListener('DOMContentLoaded', function() {
    const createPollForm = document.getElementById('create-poll-form');
    const pollCreatedDiv = document.getElementById('poll-created');
    const pollUrlInput = document.getElementById('poll-url');
    const pollLink = document.getElementById('poll-link');
    const copyUrlButton = document.getElementById('copy-url');

    createPollForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(createPollForm);
        const pollData = {
            title: formData.get('title'),
            description: formData.get('description')
        };

        try {
            const response = await fetch('/api/polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pollData)
            });

            if (response.ok) {
                const result = await response.json();
                const pollUrl = `${window.location.origin}${result.poll_url}`;
                
                // Show success message and poll URL
                pollUrlInput.value = pollUrl;
                pollLink.href = pollUrl;
                pollCreatedDiv.style.display = 'block';
                
                // Reset form
                createPollForm.reset();
                
                // Scroll to the result
                pollCreatedDiv.scrollIntoView({ behavior: 'smooth' });
                
            } else {
                const error = await response.json();
                alert('Error creating poll: ' + error.detail);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating poll. Please try again.');
        }
    });

    // Copy URL functionality
    copyUrlButton.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(pollUrlInput.value);
            
            // Visual feedback
            const originalText = copyUrlButton.textContent;
            copyUrlButton.textContent = 'Copied!';
            copyUrlButton.classList.add('btn-success');
            
            setTimeout(() => {
                copyUrlButton.textContent = originalText;
                copyUrlButton.classList.remove('btn-success');
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            pollUrlInput.select();
            pollUrlInput.setSelectionRange(0, 99999);
            document.execCommand('copy');
            
            copyUrlButton.textContent = 'Copied!';
            setTimeout(() => {
                copyUrlButton.textContent = 'Copy';
            }, 2000);
        }
    });
});
