import { teamData, logoData } from "../data/data.js";

document.addEventListener("DOMContentLoaded", function () {
  renderTeam();

  function renderTeam() {
    const teamContainer = document.getElementById("team-members");

    teamData.forEach((member, index) => {
      const isEven = index % 2 === 0;

      const memberCard = `
        <div class="row ${isEven ? "flex-row-reverse" : ""} mb-5 border rounded-4 border-light member-card">
          <div class="col-md-4 d-flex align-items-center justify-content-center">
            <img src="${member.imageUrl}" class="team-photo img-fluid rounded-circle my-3" alt="${member.name}">
          </div>
          <div class="col-md-8 d-flex align-items-center">
            <div class="m-1 text-center border border-light rounded-4 team-card ${
              isEven ? "slide-in-right" : "slide-in-left"
            }">
              <div class="row ${isEven ? "" : "flex-row-reverse"} m-2">
                <div class="col-md-9">
                  <h5 class="mb-0">${member.name}</h5>
                  <h6 class="mb-2">${member.title}</h6>
                </div>
                <div class="col-md-3 position-relative">
                <div class="position-relative d-inline-block">
                  <button class="btn btn-outline-light tech-stack-btn" >
                    <i class="fa-solid fa-code"></i> 
                  </button>
                  <div class="icons-circle" data-techstack="${index}"></div>
                </div>
                  
                  <a class="btn btn-outline-light" target="_blank" href="${member.gitHub}">
                    <i class="fa-brands fa-github"></i>
                  </a>
                  <a class="btn btn-outline-light" target="_blank" href="${member.linkedIn}">
                    <i class="fa-brands fa-linkedin"></i>
                  </a>
                </div>
              </div>
              <p class="m-2">${member.description}</p>
            </div>
          </div>
        </div>
      `;
      teamContainer.innerHTML += memberCard;
    });

    // Attach event listeners for tech stack buttons
    document.querySelectorAll(".tech-stack-btn").forEach((btn, index) => {
      btn.addEventListener("mouseover", () => showTechStackIcons(index));
      btn.addEventListener("mouseleave", hideTechStackIcons);
    });

    // Trigger animations on scroll using Intersection Observer
    handleScrollAnimations();
  }

  // Show tech stack icons on hover
  function showTechStackIcons(index) {
    const member = teamData[index];
    const techStack = member.techStack;
    const iconsContainer = document.querySelector(`.icons-circle[data-techstack="${index}"]`);

    iconsContainer.innerHTML = ""; // Clear previous icons

    const iconSize = 25;
    const positionDistance = 100;
    const positionMultiplier = 1.5;
    const numberOfIconsToSplit = 15;
    const animationTime = 1000;

    const numberOfIcons = techStack.length;

    // Determine how to distribute icons: single circle or double circle
    let angleStep, angleStepOuter, adjustedDistanceOuter;
    if (numberOfIcons <= numberOfIconsToSplit) {
      // Single circle
      angleStep = (2 * Math.PI) / numberOfIcons;
    } else {
      // Double circle
      const half = Math.ceil(numberOfIcons / 2);
      angleStep = (2 * Math.PI) / half;
      angleStepOuter = (2 * Math.PI) / (numberOfIcons - half);
      adjustedDistanceOuter = positionDistance * positionMultiplier;
    }

    techStack.forEach((tech, idx) => {
      const iconData = logoData.find((logo) => logo.name === tech);
      if (!iconData) return;

      let iconSVG = iconData.image;
      iconSVG = iconSVG.replace("<svg", `<svg height="${iconSize}" width="${iconSize}" class="svg-icon"`);
      iconSVG = iconSVG.replace("<path", `<path fill="white"`);

      const iconElement = document.createElement("div");
      iconElement.className = "icon";
      iconElement.style.opacity = 0;
      iconElement.innerHTML = iconSVG;
      iconsContainer.appendChild(iconElement);

      let angle, x, y;
      if (numberOfIcons <= numberOfIconsToSplit) {
        // Single circle
        angle = idx * angleStep;
        x = Math.cos(angle) * positionDistance;
        y = Math.sin(angle) * positionDistance;
      } else {
        // Double circle
        if (idx < numberOfIcons / 2) {
          angle = idx * angleStep;
          x = Math.cos(angle) * positionDistance;
          y = Math.sin(angle) * positionDistance;
        } else {
          angle = (idx - Math.ceil(numberOfIcons / 2)) * angleStepOuter;
          x = Math.cos(angle) * adjustedDistanceOuter;
          y = Math.sin(angle) * adjustedDistanceOuter;
        }
      }

      // Set initial position to the center (before animation)
      iconElement.style.left = `0px`;
      iconElement.style.top = `0px`;
      iconElement.style.position = "absolute";

      // Animate each icon with a slight delay
      setTimeout(() => {
        iconElement.style.opacity = 1;
        iconElement.style.left = `${x}px`;
        iconElement.style.top = `${y}px`;
        iconElement.style.transform = "scale(1)";
      }, (animationTime / numberOfIcons) * idx); // Delay based on the index, adjust as needed
    });
  }

  // Hide tech stack icons on mouse leave
  function hideTechStackIcons(event) {
    const iconsContainer = event.currentTarget.nextElementSibling;
    if (iconsContainer) {
      iconsContainer.innerHTML = ""; // Clear icons to reset
    }
  }

  function handleScrollAnimations() {
    const cards = document.querySelectorAll(".team-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    cards.forEach((card) => {
      observer.observe(card);
    });
  }
});
