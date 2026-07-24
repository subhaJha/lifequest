import Phaser from 'phaser';
import { Hero } from '../entities/Hero';
import { Building } from '../entities/Building';

export default class KingdomScene extends Phaser.Scene {
  private hero: Hero | null = null;
  private buildings: Building[] = [];
  private camera: Phaser.Cameras.Scene2D.Camera | null = null;
  private map: Phaser.Physics.Arcade.StaticGroup | null = null;
  private selectedBuilding: Building | null = null;
  private keys: any = {};

  constructor() {
    super('KingdomScene');
  }

  create(): void {
    // Create the map background
    const mapImage = this.add.image(512, 512, 'kingdom-map');
    mapImage.setDepth(-1);

    // Setup camera
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, 1024, 1024);
    this.camera.zoom = 1;

    // Create hero at center
    this.hero = new Hero(this, 512, 512, 'hero-idle');
    this.camera.startFollow(this.hero);

    // Create buildings around the kingdom
    this.createCastle();
    this.createTowers();
    this.createHouses();

    // Setup input handlers
    this.setupInputHandlers();

    // Listen for XP gained events
    this.events.on('xp-gained', (amount: number) => {
      this.handleXPGained(amount);
    });

    // Enable world bounds collision
    this.physics.world.setBounds(0, 0, 1024, 1024);
  }

  private createCastle(): void {
    if (!this.hero) return;

    const castle = new Building(this, {
      name: 'Royal Castle',
      type: 'castle',
      x: 512,
      y: 300,
      level: 1,
      resourcesProduced: 10,
    });

    this.buildings.push(castle);
  }

  private createTowers(): void {
    const towerPositions = [
      { x: 300, y: 200 },
      { x: 700, y: 200 },
      { x: 300, y: 800 },
      { x: 700, y: 800 },
    ];

    towerPositions.forEach((pos) => {
      const tower = new Building(this, {
        name: `Guard Tower ${this.buildings.length}`,
        type: 'tower',
        x: pos.x,
        y: pos.y,
        level: 1,
        resourcesProduced: 5,
      });

      this.buildings.push(tower);
    });
  }

  private createHouses(): void {
    const housePositions = [
      { x: 400, y: 450 },
      { x: 600, y: 450 },
      { x: 400, y: 600 },
      { x: 600, y: 600 },
    ];

    housePositions.forEach((pos) => {
      const house = new Building(this, {
        name: `House ${this.buildings.length}`,
        type: 'house',
        x: pos.x,
        y: pos.y,
        level: 1,
        resourcesProduced: 3,
      });

      this.buildings.push(house);
    });
  }

  private setupInputHandlers(): void {
    // Keyboard input
    this.input.keyboard?.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.keys = this.input.keyboard?.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Mouse click to move hero
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.hero) {
        // Check if clicking on building
        const clickedBuilding = this.buildings.find(
          (b) => Phaser.Math.Distance.Between(b.x, b.y, pointer.worldX, pointer.worldY) < 40
        );

        if (clickedBuilding) {
          if (this.selectedBuilding && this.selectedBuilding !== clickedBuilding) {
            this.selectedBuilding.deselect();
          }
          clickedBuilding.select();
          this.selectedBuilding = clickedBuilding;
        } else {
          // Move hero toward clicked position
          if (this.selectedBuilding) {
            this.selectedBuilding.deselect();
            this.selectedBuilding = null;
          }
          this.hero.moveToward(pointer.worldX, pointer.worldY, 150);
        }
      }
    });

    // Camera zoom with mouse wheel
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaY: number) => {
      if (this.camera) {
        const zoomSpeed = 0.05;
        const newZoom = Phaser.Math.Clamp(
          this.camera.zoom - deltaY * zoomSpeed * 0.001,
          0.5,
          2
        );
        this.camera.setZoom(newZoom);
      }
    });
  }

  private handleXPGained(amount: number): void {
    // Emit to parent components through registry
    const callback = this.registry.get('onXPGained');
    if (callback) {
      callback(amount);
    }
  }

  update(): void {
    if (!this.hero) return;

    // Handle keyboard movement
    let isMoving = false;
    let vx = 0;
    let vy = 0;
    const speed = 150;

    if (this.keys.w?.isDown) {
      vy -= speed;
      isMoving = true;
    }
    if (this.keys.s?.isDown) {
      vy += speed;
      isMoving = true;
    }
    if (this.keys.a?.isDown) {
      vx -= speed;
      isMoving = true;
    }
    if (this.keys.d?.isDown) {
      vx += speed;
      isMoving = true;
    }

    if (isMoving) {
      const body = this.hero.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(vx, vy);
      this.hero.playWalkAnimation();

      // Flip based on direction
      if (vx < 0) {
        this.hero.setFlipX(true);
      } else if (vx > 0) {
        this.hero.setFlipX(false);
      }
    } else {
      const body = this.hero.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      this.hero.playIdleAnimation();
    }
  }

  public getHero(): Hero | null {
    return this.hero;
  }

  public getBuildings(): Building[] {
    return this.buildings;
  }

  public getSelectedBuilding(): Building | null {
    return this.selectedBuilding;
  }

  shutdown(): void {
    this.buildings.forEach((b) => b.cleanup());
  }
}
