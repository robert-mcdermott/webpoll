document.addEventListener('DOMContentLoaded', function() {
    const addItemForm = document.getElementById('add-item-form');
    const votingItemsContainer = document.getElementById('voting-items');
    const noItemsDiv = document.getElementById('no-items');
    const voteCountSpan = document.getElementById('vote-count');
    const chartCanvas = document.getElementById('chart');
    const ctx = chartCanvas.getContext('2d');

    let pollData = null;
    let currentVoteItemId = null;

    // Add item functionality
    addItemForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(addItemForm);
        const itemData = {
            text: formData.get('text')
        };

        try {
            const response = await fetch(`/api/polls/${window.pollId}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemData)
            });

            if (response.ok) {
                const result = await response.json();
                addItemForm.reset();
                refreshPollData();
            } else {
                const error = await response.json();
                alert('Error adding item: ' + error.detail);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding item. Please try again.');
        }
    });

    // Vote functionality
    function attachVoteListeners() {
        const voteButtons = document.querySelectorAll('.btn-vote');
        voteButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const itemId = this.getAttribute('data-item-id');
                await vote(itemId);
            });
        });
    }

    async function vote(itemId) {
        try {
            const response = await fetch(`/api/polls/${window.pollId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    item_id: itemId,
                    user_id: window.userId
                })
            });

            if (response.ok) {
                currentVoteItemId = itemId;
                refreshPollData();
            } else {
                const error = await response.json();
                alert('Error voting: ' + error.detail);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error voting. Please try again.');
        }
    }

    // Refresh poll data
    async function refreshPollData() {
        try {
            const response = await fetch(`/api/polls/${window.pollId}/results`);
            if (response.ok) {
                pollData = await response.json();
                updateUI();
                drawChart();
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }

    // Update UI with new data
    function updateUI() {
        if (!pollData || !pollData.items) return;

        // Update vote count
        voteCountSpan.textContent = pollData.total_votes;

        // Clear and rebuild voting items
        votingItemsContainer.innerHTML = '';
        
        if (pollData.items.length === 0) {
            if (noItemsDiv) noItemsDiv.style.display = 'block';
        } else {
            if (noItemsDiv) noItemsDiv.style.display = 'none';
            
            pollData.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'vote-item';
                itemDiv.setAttribute('data-item-id', item.id);
                
                const isCurrentVote = currentVoteItemId === item.id;
                const buttonClass = isCurrentVote ? 'btn btn-vote btn-voted' : 'btn btn-vote';
                const buttonText = isCurrentVote ? 'Voted ✓' : 'Vote';
                
                itemDiv.innerHTML = `
                    <div class="item-content">
                        <span class="item-text">${escapeHtml(item.text)}</span>
                        <span class="vote-count">${item.votes} votes</span>
                    </div>
                    <button class="${buttonClass}" data-item-id="${item.id}">
                        ${buttonText}
                    </button>
                `;
                
                votingItemsContainer.appendChild(itemDiv);
            });
            
            attachVoteListeners();
        }
    }

    // Chart drawing functionality
    function drawChart() {
        if (!pollData || !pollData.items || pollData.items.length === 0) {
            ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No votes yet', chartCanvas.width / 2, chartCanvas.height / 2);
            return;
        }

        const items = pollData.items;
        const maxVotes = Math.max(...items.map(item => item.votes), 1);
        
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        
        const barHeight = 30;
        const barMargin = 10;
        const totalHeight = items.length * (barHeight + barMargin) - barMargin;
        const startY = (chartCanvas.height - totalHeight) / 2;
        const maxBarWidth = chartCanvas.width * 0.7;
        
        items.forEach((item, index) => {
            const y = startY + index * (barHeight + barMargin);
            const barWidth = maxVotes > 0 ? (item.votes / maxVotes) * maxBarWidth : 0;
            
            // Draw bar
            const colors = ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'];
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(50, y, barWidth, barHeight);
            
            // Draw item text
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            const truncatedText = item.text.length > 20 ? item.text.substring(0, 20) + '...' : item.text;
            ctx.fillText(truncatedText, 55, y + barHeight / 2 + 5);
            
            // Draw vote count
            ctx.textAlign = 'right';
            ctx.fillText(item.votes.toString(), chartCanvas.width - 10, y + barHeight / 2 + 5);
        });
    }

    // Utility function to escape HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Auto-refresh every 2 seconds
    setInterval(refreshPollData, 2000);
    
    // Initial load
    refreshPollData();
});
