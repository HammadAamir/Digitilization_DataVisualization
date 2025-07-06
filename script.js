document.addEventListener('DOMContentLoaded', () => {
    const showChartButton = document.getElementById('show-chart-button');
    const backButton = document.getElementById('back-button');
    const macContainer = document.getElementById('mac-container');
    const iphoneContainer = document.getElementById('iphone-container');
    const initialMacContent = document.getElementById('initial-mac-content');
    const chartMacContent = document.getElementById('chart-mac-content');
    const d3ChartContainer = document.querySelector('.d3-chart-container');
    const body = document.body;

    // Sample data for the D3 chart (Zettabytes of data generated per year)
    const data = [
        { year: 2018, zettabytes: 33 },
        { year: 2019, zettabytes: 41 },
        { year: 2020, zettabytes: 59 },
        { year: 2021, zettabytes: 79 },
        { year: 2022, zettabytes: 97 },
        { year: 2023, zettabytes: 120 },
        { year: 2024, zettabytes: 145 },
        { year: 2025, zettabytes: 175 }
    ];

    // THREE.js Global variables for the 3D globe
    let scene, camera, renderer, globe, lines;
    let animationFrameId; // To store the requestAnimationFrame ID
    let isGlobeInitialized = false; // Flag to track if globe is initialized

    /**
     * Initializes the 3D globe using Three.js.
     * Sets up the scene, camera, renderer, globe sphere, and grid lines.
     */
    function initGlobe() {
        if (isGlobeInitialized) return; // Prevent re-initialization
        const canvas = document.getElementById('globe-canvas');
        if (!canvas) return; // Ensure canvas exists

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        // Scene setup
        scene = new THREE.Scene();

        // Camera setup
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 2; // Position camera away from the globe for a clear view

        // Renderer setup with transparency
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0); // Transparent background

        // Globe Sphere creation
        const geometry = new THREE.SphereGeometry(1, 32, 32); // Radius, widthSegments, heightSegments
        const material = new THREE.MeshPhongMaterial({
            color: 0x3498db, // A shade of blue for the globe
            specular: 0x555555,
            shininess: 30,
            transparent: true,
            opacity: 0.9 // Slightly transparent
        });
        globe = new THREE.Mesh(geometry, material);
        scene.add(globe);

        // Add digital-looking grid lines to the globe
        const wireframe = new THREE.WireframeGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff, // White lines
            linewidth: 1, // Note: linewidth property might not be fully supported across all platforms
            transparent: true,
            opacity: 0.3 // Semi-transparent lines
        });
        lines = new THREE.LineSegments(wireframe, lineMaterial);
        scene.add(lines);

        // Lighting for the scene
        const ambientLight = new THREE.AmbientLight(0x404040); // Soft ambient light
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Directional light for shadows/highlights
        directionalLight.position.set(0, 1, 1).normalize(); // Position the light
        scene.add(directionalLight);

        isGlobeInitialized = true;
        animateGlobe(); // Start the animation loop for the globe
    }

    /**
     * Animation loop for the 3D globe.
     * Rotates the globe and renders the scene.
     */
    function animateGlobe() {
        if (!isGlobeInitialized) return; // Only animate if initialized
        animationFrameId = requestAnimationFrame(animateGlobe);

        // Rotate the globe and its lines
        globe.rotation.y += 0.005;
        lines.rotation.y += 0.005;

        renderer.render(scene, camera);
    }

    /**
     * Resizes the Three.js canvas and updates the camera aspect ratio on window resize.
     */
    function resizeGlobeCanvas() {
        if (!isGlobeInitialized || !renderer) return;
        const canvas = document.getElementById('globe-canvas');
        if (!canvas) return;
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera); // Re-render after resize
    }

    /**
     * Disposes of Three.js resources to free up memory.
     */
    function disposeGlobe() {
        if (!isGlobeInitialized) return; // Only dispose if initialized

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (renderer) {
            renderer.dispose();
            renderer = null;
        }
        // Dispose of scene objects' geometries and materials
        if (scene) {
            scene.traverse(function(object) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (object.material.length) {
                        for (let i = 0; i < object.material.length; i++) {
                            object.material[i].dispose();
                        }
                    } else {
                        object.material.dispose();
                    }
                }
                if (object.texture) object.texture.dispose();
            });
            scene = null;
        }
        globe = null;
        lines = null;
        camera = null;

        // Clear the canvas element to remove old rendering context
        const canvas = document.getElementById('globe-canvas');
        if (canvas) {
            const gl = canvas.getContext('webgl');
            if (gl) {
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            }
        }
        isGlobeInitialized = false; // Reset initialization flag
    }

    // Function to handle showing the chart view
    showChartButton.addEventListener('click', () => {
        disposeGlobe(); // Stop and dispose globe when switching to chart view
        body.classList.add('chart-view');

        // Hide initial content after a short delay to allow Mac transition to start
        setTimeout(() => {
            initialMacContent.style.opacity = '0';
            initialMacContent.style.pointerEvents = 'none'; // Disable interaction
        }, 500);

        // After the Mac transition, show chart content and draw chart
        macContainer.addEventListener('transitionend', function handler() {
            if (body.classList.contains('chart-view')) {
                initialMacContent.style.display = 'none'; // Fully hide
                chartMacContent.style.opacity = '1';
                chartMacContent.style.pointerEvents = 'auto'; // Enable interaction
                drawChart(); // Draw D3 chart once animation is mostly complete
            }
            macContainer.removeEventListener('transitionend', handler);
        });
    });

    // Function to handle going back to the initial view
    backButton.addEventListener('click', () => {
        body.classList.remove('chart-view');

        // Hide chart content immediately as Mac transitions back
        chartMacContent.style.opacity = '0';
        chartMacContent.style.pointerEvents = 'none'; // Disable interaction

        // After the Mac transition back, show initial content and re-initialize globe
        macContainer.addEventListener('transitionend', function handler() {
            if (!body.classList.contains('chart-view')) {
                // Ensure it's the correct transition back
                initialMacContent.style.display = 'flex'; // Show again
                initialMacContent.style.opacity = '1';
                initialMacContent.style.pointerEvents = 'auto'; // Enable interaction
                setTimeout(initGlobe, 100); // Re-initialize globe after a slight delay
            }
            macContainer.removeEventListener('transitionend', handler);
        });
    });


    /**
     * Draws the D3.js bar chart.
     * This function is called when the chart view is activated.
     */
    function drawChart() {
        // Clear any existing SVG to prevent duplicates on redraws
        d3ChartContainer.innerHTML = '';

        // Set the dimensions of the chart container dynamically
        const containerWidth = d3ChartContainer.offsetWidth;
        const containerHeight = d3ChartContainer.offsetHeight;

        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        // Append the SVG object to the d3ChartContainer
        const svg = d3.select(d3ChartContainer)
            .append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.year))
            .padding(0.2);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .attr("class", "axis");

        // Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.zettabytes) + 20]) // Add some padding to the max
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "axis");

        // Tooltip
        const tooltip = d3.select("#tooltip");

        // Bars
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.year))
            .attr("y", d => y(d.zettabytes))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.zettabytes))
            .on("mouseover", function(event, d) {
                tooltip.style("opacity", 1)
                       .html(`Year: ${d.year}<br>Data: ${d.zettabytes} ZB`)
                       .style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
                d3.select(this).style("fill", "#81C784"); // Lighter green on hover
            })
            .on("mouseout", function(event, d) {
                tooltip.style("opacity", 0);
                d3.select(this).style("fill", "#4CAF50"); // Original green
            });

        // Add X axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 5)
            .attr("fill", "#e2e8f0")
            .text("Year");

        // Add Y axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -height / 2)
            .attr("fill", "#e2e8f0")
            .text("Zettabytes (ZB)");

        // Handle window resize for responsiveness
        window.addEventListener('resize', () => {
            // Only redraw chart if it's currently visible
            if (body.classList.contains('chart-view')) {
                drawChart();
            }
        });
    }

    // Initial call to setup globe when DOM is ready
    // A slight delay ensures canvas dimensions are stable after CSS loads
    window.onload = function() {
        setTimeout(initGlobe, 100);
    };

    // Add resize listener for the globe canvas
    window.addEventListener('resize', () => {
        // Ensure the globe canvas is present before attempting to resize
        const globeCanvas = document.getElementById('globe-canvas');
        if (globeCanvas && !body.classList.contains('chart-view')) {
            resizeGlobeCanvas();
        }
    });
});
