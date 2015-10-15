IDE_Morph.prototype.originalOpenIn = IDE_Morph.prototype.openIn;
IDE_Morph.prototype.openIn = function(world) {
	this.originalOpenIn(world);
	if (location.hash.substr(0, 9) === '#tutorial' && ! world.tutorialWasShown) {
		world.tutorialWasShown = true;
		this.startTutorial(world);
	}
}

IDE_Morph.prototype.startTutorial = function(world) {
	var morph,
		myself = this;

	if (!this.tutorial) { 
		this.tutorial = {};
		this.tutorial.slides = [];
		this.tutorial.currentIndex = 0;

		this.tutorial.addSlide = function(slide) {
			this.slides.push(slide);
                        slide.fixLayout();
		};

		this.tutorial.previous = function() {
			this.currentSlide.cancel();
			this.currentIndex--;
			this.currentSlide = this.slides[this.currentIndex];
			if (this.currentIndex == 0) {
				this.currentSlide.previousButton.disable();
			}
			this.currentSlide.popUp(world);
		};
		this.tutorial.next = function() {
			this.currentSlide.cancel();
			this.currentIndex++;
			this.currentSlide = this.slides[this.currentIndex];
			if (this.currentIndex == this.slides.length - 1) {
				this.currentSlide.nextButton.disable();
			}
			this.currentSlide.popUp(world);
		};
		
		this.tutorial.startIn = function(world) {
			this.currentSlide = this.slides[0]
			this.currentSlide.popUp(world);
		};
	}; 

	this.tutorial.addSlide((new DialogBoxMorph).tutorialWindow(
			'Welcome to BeetleBlocks!', //title
			new AnimationMorph('beetleblocks/assets/tutorial/move/', 93, 50),
			  'Drag the move block into the scripting area and\n' //msg
			+ 'click on it to move the Beetle:',
			null, // popUpPosition
			null, // arrowOrientation ('left' / 'right' / 'top' / 'bottom')
			null, // previousWindow function
			function() { myself.tutorial.next() } // nextWindow function
	));


	this.tutorial.addSlide((new DialogBoxMorph).tutorialWindow(
			'Ara us toca a vosaltres!', 
			null, 
			  'Intenteu ampliar aquest programa!\n\n'
			+ 'Podeu utilitzar els blocs que us proposem, però la millor manera d\'aprendre\n'
			+ 'a programar és explorar pel vostre compte i anar descobrint com construir\n'
			+ 'programes cada cop més complicats.\n\n'
			+ 'Esperem que aquest tutorial us hagi estat útil, i recordeu que podeu tornar-hi\n'
			+ 'a accedir en qualsevol moment mitjançant la opció "Tutorial" del menú d\'arxiu.\n\n'
			+ 'Moltes gràcies per la vostra atenció!',
			myself.stage.position(),
			null,
			function() { myself.tutorial.previous() },
			function() { myself.tutorial.next() }
	));

	this.tutorial.startIn(world);
}
