document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("card-carousel");
    let cards = [];
    let currentIndex = 0;
    let visibleCount = getVisibleCount();
    let autoSlideInterval;
  
    // Load cards
    fetch("../json/cards.json")
      .then((res) => res.json())
      .then((data) => {
        cards = data;
        renderCards();
        updateCarousel();
        startAutoScroll();
      });
  
    function getVisibleCount() {
      const width = window.innerWidth;
      if (width >= 1200) return 6;
      if (width >= 992) return 4;
      if (width >= 768) return 3;
      return 1;
    }
  
    function renderCards() {
      container.innerHTML = "";
      cards.forEach((card) => {
        const div = document.createElement("div");
        div.className = "card-slide";
        div.innerHTML = `
          <div class="card h-100">
            <img src="${card.image}" class="card-img-top" alt="${card.title}">
            <div class="card-body text-center p-2">
              <h6 class="card-title mb-1">${card.title}</h6>
              <p class="card-text small">${card.price}</p>
            </div>
          </div>
        `;
        container.appendChild(div);
      });
    }
  
    function updateCarousel() {
      const slide = container.querySelector(".card-slide");
      if (!slide) return;
      const slideWidth = slide.offsetWidth + 16; // includes padding
      const offset = currentIndex * slideWidth;
      container.style.transform = `translateX(-${offset}px)`;
    }
  
    function nextSlide() {
      if (currentIndex < cards.length - visibleCount) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      updateCarousel();
    }
  
    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = cards.length - visibleCount;
      }
      updateCarousel();
    }
  
    document.getElementById("nextBtn").addEventListener("click", () => {
      clearInterval(autoSlideInterval);
      nextSlide();
      startAutoScroll();
    });
  
    document.getElementById("prevBtn").addEventListener("click", () => {
      clearInterval(autoSlideInterval);
      prevSlide();
      startAutoScroll();
    });
  
    function startAutoScroll() {
      autoSlideInterval = setInterval(nextSlide, 2500);
    }
  
    container.addEventListener("mouseenter", () => clearInterval(autoSlideInterval));
    container.addEventListener("mouseleave", startAutoScroll);
  
    // Handle window resize
    window.addEventListener("resize", () => {
      visibleCount = getVisibleCount();
      updateCarousel();
    });
  });