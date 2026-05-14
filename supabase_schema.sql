-- SQL Schema for Farm Management

-- 1. Create the Farms table
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "farmerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "totalArea" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "subCounty" TEXT,
    "registrationDate" DATE DEFAULT CURRENT_DATE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add foreign key to Crops table (Assuming crops table exists)
-- If crops table doesn't exist yet, run the creation script below first.
ALTER TABLE crops 
ADD COLUMN IF NOT EXISTS "farmId" UUID REFERENCES farms(id) ON DELETE CASCADE;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow users to see only their own farms
CREATE POLICY "Users can view their own farms" 
ON farms FOR SELECT 
USING (auth.uid() = "farmerId");

-- Allow users to insert their own farms
CREATE POLICY "Users can insert their own farms" 
ON farms FOR INSERT 
WITH CHECK (auth.uid() = "farmerId");

-- Allow users to update their own farms
CREATE POLICY "Users can update their own farms" 
ON farms FOR UPDATE 
USING (auth.uid() = "farmerId");

-- Allow users to delete their own farms
CREATE POLICY "Users can delete their own farms" 
ON farms FOR DELETE 
USING (auth.uid() = "farmerId");

-- 5. Helper: If you need to create the Crops table with the new structure
/*
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "farmId" UUID REFERENCES farms(id) ON DELETE CASCADE,
    "farmerId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "plantingDate" DATE NOT NULL,
    "expectedHarvest" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planted',
    "healthScore" INTEGER DEFAULT 100,
    "location" TEXT,
    "area" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own crops" 
ON crops FOR ALL 
USING (auth.uid() = "farmerId");
*/
