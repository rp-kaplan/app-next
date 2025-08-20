export const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            'ui': ['Inter', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white font-ui">
  <header class="bg-white/10 backdrop-blur-md border-b border-white/20 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        🚀 Welcome to My Project
      </h1>
      <p class="text-gray-300 mt-2">Built with modern web technologies</p>
    </div>
  </header>
  
  <main class="max-w-4xl mx-auto p-8">
    <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
      <div class="text-center space-y-6">
        <h2 class="text-2xl font-semibold text-white">Ready to Build Something Amazing?</h2>
        <p class="text-gray-300">This is your project starter template. Edit the files to customize your project!</p>
        
        <div class="space-y-4">
          <button 
            onclick="showMessage()" 
            class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            ✨ Click me for a surprise!
          </button>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div class="bg-white/5 border border-white/10 rounded-lg p-4">
              <div class="text-2xl mb-2">📄</div>
              <h3 class="font-semibold mb-1">HTML</h3>
              <p class="text-sm text-gray-400">Structure your content</p>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4">
              <div class="text-2xl mb-2">🎨</div>
              <h3 class="font-semibold mb-1">CSS</h3>
              <p class="text-sm text-gray-400">Style your design</p>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-lg p-4">
              <div class="text-2xl mb-2">⚡</div>
              <h3 class="font-semibold mb-1">JavaScript</h3>
              <p class="text-sm text-gray-400">Add interactivity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  
  <script src="script.js"></script>
</body>
</html>`;

export const defaultCSS = `/* Custom styles for your project */
/* Tailwind CSS is already included via CDN in the HTML */

/* You can add custom CSS here that extends Tailwind */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Custom gradient backgrounds */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Glass morphism effect */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Custom button hover effects */
.btn-hover {
  transition: all 0.3s ease;
}

.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}`;

export const defaultJS = `console.log('Welcome to your project!');

function showMessage() {
  alert('Hello! This is your custom JavaScript function.');
}

// Add some interactive functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded successfully!');
  
  // Add some animation
  const container = document.querySelector('.container');
  if (container) {
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      container.style.transition = 'all 0.6s ease';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 100);
  }
});`;
