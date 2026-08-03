-- Preserve every previously captured free-text recipe as the preparation process.
ALTER TABLE "FoodCatalogItem"
RENAME COLUMN "receta" TO "preparacion";

CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreNormalizado" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "foodCatalogItemId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "cantidad" DECIMAL(10,3) NOT NULL,
    "unidad" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Ingredient_nombreNormalizado_key" ON "Ingredient"("nombreNormalizado");
CREATE INDEX "Ingredient_categoria_idx" ON "Ingredient"("categoria");
CREATE INDEX "Ingredient_nombre_idx" ON "Ingredient"("nombre");
CREATE INDEX "RecipeIngredient_ingredientId_idx" ON "RecipeIngredient"("ingredientId");
CREATE UNIQUE INDEX "RecipeIngredient_foodCatalogItemId_ingredientId_key"
ON "RecipeIngredient"("foodCatalogItemId", "ingredientId");
CREATE UNIQUE INDEX "RecipeIngredient_foodCatalogItemId_orden_key"
ON "RecipeIngredient"("foodCatalogItemId", "orden");

ALTER TABLE "RecipeIngredient"
ADD CONSTRAINT "RecipeIngredient_foodCatalogItemId_fkey"
FOREIGN KEY ("foodCatalogItemId") REFERENCES "FoodCatalogItem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecipeIngredient"
ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey"
FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- These tables are accessed through the server-side Prisma client, not the public Data API.
ALTER TABLE "Ingredient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecipeIngredient" ENABLE ROW LEVEL SECURITY;
