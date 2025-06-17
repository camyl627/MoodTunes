// MoodTunes Chatbot Service
// Handles all chatbot logic, responses, and mood analysis

class ChatbotService {
  constructor() {
    this.conversationHistory = [];
    this.userMoods = [];
    this.musicGenres = {
      happy: ['Pop', 'Dance', 'Funk', 'Reggae', 'Upbeat Rock'],
      sad: ['Blues', 'Indie', 'Alternative', 'Acoustic', 'Ballads'],
      energetic: ['Electronic', 'Hip Hop', 'Rock', 'Punk', 'Metal'],
      chill: ['Lo-fi', 'Ambient', 'Jazz', 'Bossa Nova', 'Indie Folk'],
      romantic: ['R&B', 'Soul', 'Soft Rock', 'Jazz', 'Classical'],
      angry: ['Metal', 'Punk', 'Hard Rock', 'Rap', 'Industrial'],
      nostalgic: ['Classic Rock', 'Oldies', 'Vintage Pop', 'Folk', 'Country'],
      focused: ['Instrumental', 'Classical', 'Ambient', 'Post-Rock', 'Piano']
    };
    
    this.moodKeywords = {
      happy: ['happy', 'joy', 'excited', 'cheerful', 'upbeat', 'positive', 'good', 'great', 'amazing', 'wonderful'],
      sad: ['sad', 'down', 'depressed', 'blue', 'melancholy', 'lonely', 'heartbroken', 'upset', 'crying'],
      energetic: ['energetic', 'pumped', 'hyped', 'active', 'workout', 'gym', 'running', 'dancing', 'party'],
      chill: ['chill', 'relaxed', 'calm', 'peaceful', 'mellow', 'laid-back', 'easy', 'smooth', 'zen'],
      romantic: ['romantic', 'love', 'date', 'intimate', 'passionate', 'sweet', 'loving', 'tender'],
      angry: ['angry', 'mad', 'frustrated', 'annoyed', 'rage', 'furious', 'pissed', 'irritated'],
      nostalgic: ['nostalgic', 'memories', 'old times', 'past', 'remember', 'childhood', 'vintage', 'classic'],
      focused: ['focus', 'study', 'work', 'concentrate', 'productive', 'thinking', 'reading', 'coding']
    };
  }

  // Main message processing function
  async processMessage(userInput) {
    this.conversationHistory.push({ type: 'user', message: userInput, timestamp: new Date() });
    
    // Simulate processing delay for realistic feel
    await this.delay(800 + Math.random() * 1200);
    
    const detectedMood = this.analyzeMood(userInput);
    const response = this.generateResponse(userInput, detectedMood);
    
    this.conversationHistory.push({ type: 'bot', message: response, timestamp: new Date() });
    
    return response;
  }

  // Analyze user mood from their message
  analyzeMood(message) {
    const lowerMessage = message.toLowerCase();
    const moodScores = {};
    
    // Initialize mood scores
    Object.keys(this.moodKeywords).forEach(mood => {
      moodScores[mood] = 0;
    });
    
    // Score based on keyword matches
    Object.entries(this.moodKeywords).forEach(([mood, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          moodScores[mood] += 1;
        }
      });
    });
    
    // Find the highest scoring mood
    const detectedMood = Object.entries(moodScores)
      .reduce((a, b) => moodScores[a[0]] > moodScores[b[0]] ? a : b)[0];
    
    // Only return mood if there's a clear match
    if (moodScores[detectedMood] > 0) {
      this.userMoods.push({ mood: detectedMood, timestamp: new Date() });
      return detectedMood;
    }
    
    return null;
  }

  // Generate contextual responses
  generateResponse(userInput, detectedMood) {
    const responses = this.getResponseTemplates();
    
    // Mood-specific responses
    if (detectedMood && responses.moodSpecific[detectedMood]) {
      const moodResponses = responses.moodSpecific[detectedMood];
      const randomResponse = moodResponses[Math.floor(Math.random() * moodResponses.length)];
      return this.addMusicSuggestion(randomResponse, detectedMood);
    }
    
    // Check for specific intents
    const lowerInput = userInput.toLowerCase();
    
    if (this.containsAny(lowerInput, ['recommend', 'suggest', 'play', 'music', 'song', 'artist'])) {
      return this.getMusicRecommendation();
    }
    
    if (this.containsAny(lowerInput, ['how are you', 'what\'s up', 'hey', 'hi', 'hello'])) {
      return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    }
    
    if (this.containsAny(lowerInput, ['thank', 'thanks', 'appreciate'])) {
      return responses.gratitude[Math.floor(Math.random() * responses.gratitude.length)];
    }
    
    if (this.containsAny(lowerInput, ['bye', 'goodbye', 'see you', 'later'])) {
      return responses.farewell[Math.floor(Math.random() * responses.farewell.length)];
    }
    
    // Default responses
    return responses.general[Math.floor(Math.random() * responses.general.length)];
  }

  // Response templates
  getResponseTemplates() {
    return {
      moodSpecific: {
        happy: [
          "I love that positive energy! 🌟",
          "That's awesome! Your good vibes are contagious! ✨",
          "Fantastic mood! Let's find some music to match that joy! 🎉",
          "You're radiating happiness! Time for some upbeat tunes! 😊"
        ],
        sad: [
          "I hear you. Music can be such a comfort during tough times 💙",
          "Sometimes we all need songs that understand how we feel 🫂",
          "Let me find something that might lift your spirits gently 🌅",
          "Music has this beautiful way of healing the heart ❤️‍🩹"
        ],
        energetic: [
          "That energy is amazing! Let's channel it into some powerful music! ⚡",
          "I'm feeling that high energy! Time for some beats that match! 🔥",
          "Love that drive! Let's find music that amplifies that power! 💪",
          "Your energy is infectious! Let's turn it up! 🚀"
        ],
        chill: [
          "Perfect vibe for some smooth, relaxing tunes 🌊",
          "I love that laid-back energy! Let's keep it mellow 😌",
          "Chill mode activated! Time for some peaceful sounds 🕯️",
          "That's the perfect mindset for some calming music 🍃"
        ],
        romantic: [
          "Aww, love is in the air! Let me find something perfect for that mood 💕",
          "That's so sweet! Time for some romantic melodies 🌹",
          "Love that feeling! Let's set the perfect musical atmosphere 💖",
          "Beautiful! Music and love go hand in hand 🎵💝"
        ],
        angry: [
          "I feel that intensity! Sometimes we need music that matches our fire 🔥",
          "Let's channel that energy into some powerful beats! 💥",
          "Music can be a great outlet for those strong emotions ⚡",
          "I get it! Let's find some music that helps you express that feeling 🌪️"
        ],
        nostalgic: [
          "Those memories deserve the perfect soundtrack 📻",
          "Nothing like music to take us back in time ⏰",
          "Let's dive into some classic sounds that honor those feelings 🎞️",
          "Music has this magical way of preserving our memories 💫"
        ],
        focused: [
          "Perfect! Let's find some music that enhances your concentration 🎯",
          "Great mindset! I know some tracks that boost productivity 📚",
          "Focus mode: ON! Let me suggest some perfect background music 🧠",
          "I love that determination! Music can be the perfect focus companion 💻"
        ]
      },
      greetings: [
        "Hey there! I'm so excited to help you discover your perfect mood music! 🎵",
        "Hi! Ready to find some amazing tunes that match your vibe? ✨",
        "Hello! I'm here to be your personal music mood curator! 🎧",
        "Hey! Let's explore what musical journey fits your current energy! 🚀"
      ],
      general: [
        "That's interesting! How does that make you feel musically? 🎵",
        "Tell me more about your current vibe! I want to find the perfect soundtrack 🎶",
        "I'm listening! What kind of musical energy are you craving right now? ✨",
        "That's cool! Let's translate that feeling into some amazing music! 🎧",
        "I love hearing about your experiences! What mood does that put you in? 🌟",
        "Interesting perspective! How can music enhance that feeling for you? 🎼"
      ],
      gratitude: [
        "You're so welcome! I love helping you find your perfect musical match! 💖",
        "Anytime! Music discovery is my passion! 🎵",
        "My pleasure! That's what I'm here for - connecting you with great music! ✨",
        "Happy to help! Keep sharing your moods and I'll keep the recommendations coming! 🎶"
      ],
      farewell: [
        "See you later! Hope you enjoy your musical journey! 🎵✨",
        "Bye! Keep exploring those amazing sounds! 🎧💫",
        "Until next time! May your playlist always match your mood! 🎶❤️",
        "Take care! Don't forget to let music be your companion! 🌟🎼"
      ]
    };
  }

  // Add music suggestions to responses
  addMusicSuggestion(response, mood) {
    if (mood && this.musicGenres[mood]) {
      const genres = this.musicGenres[mood];
      const randomGenres = this.shuffleArray([...genres]).slice(0, 2);
      return `${response} I'm thinking some ${randomGenres.join(' or ')} would be perfect! 🎶`;
    }
    return response;
  }

  // Get music recommendations
  getMusicRecommendation() {
    const recentMood = this.getRecentMood();
    if (recentMood && this.musicGenres[recentMood]) {
      const genres = this.musicGenres[recentMood];
      const randomGenres = this.shuffleArray([...genres]).slice(0, 3);
      return `Based on your ${recentMood} vibe, I'd recommend some ${randomGenres.join(', ')}! What do you think? 🎵`;
    }
    
    const recommendations = [
      "What genre speaks to your soul right now? I can suggest something perfect! 🎶",
      "Tell me your current mood and I'll curate the perfect playlist vibe! ✨",
      "I'd love to recommend something! What energy are you feeling today? 🎵",
      "Let's find your perfect sound! What's your vibe right now? 🎧"
    ];
    
    return recommendations[Math.floor(Math.random() * recommendations.length)];
  }

  // Get mood suggestions for quick selection
  getMoodSuggestions() {
    return [
      "I'm feeling happy! 😊",
      "Need something chill 😌",
      "Feeling energetic! ⚡",
      "In a romantic mood 💕",
      "Need focus music 🎯",
      "Feeling nostalgic 📻"
    ];
  }

  // Get recent mood
  getRecentMood() {
    if (this.userMoods.length === 0) return null;
    return this.userMoods[this.userMoods.length - 1].mood;
  }

  // Get conversation summary
  getConversationSummary() {
    return {
      totalMessages: this.conversationHistory.length,
      detectedMoods: this.userMoods,
      conversationLength: this.conversationHistory.length > 0 ? 
        new Date() - this.conversationHistory[0].timestamp : 0
    };
  }

  // Utility functions
  containsAny(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Reset conversation (useful for testing or new sessions)
  resetConversation() {
    this.conversationHistory = [];
    this.userMoods = [];
  }

  // Export conversation data
  exportConversationData() {
    return {
      history: this.conversationHistory,
      moods: this.userMoods,
      summary: this.getConversationSummary()
    };
  }
}

// Create and export singleton instance
export const chatbotService = new ChatbotService();

// Also export the class for custom instances
export { ChatbotService };