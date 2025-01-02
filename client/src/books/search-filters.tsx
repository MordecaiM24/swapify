import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { RangeSlider } from "@/components/ui/range-slider";

interface FiltersProps {
  filters: {
    search: string;
    condition: string[];
    hasNotes: boolean;
    hasHighlights: boolean;
    minPrice: number;
    maxPrice: number;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      search: string;
      condition: string[];
      hasNotes: boolean;
      hasHighlights: boolean;
      minPrice: number;
      maxPrice: number;
    }>
  >;
}

export function SearchFilters({ filters, setFilters }: FiltersProps) {
  const conditions = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by title, author, ISBN, or course code..."
        value={filters.search}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, search: e.target.value }))
        }
      />

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filters.condition.length > 0 ||
            filters.hasNotes ||
            filters.hasHighlights ||
            filters.minPrice > 0 ||
            filters.maxPrice < 250
              ? "Filters active"
              : "Advanced filters"}
          </p>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isOpen ? "transform rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-4">
          <div className="space-y-2 pt-4">
            <Label>Condition</Label>
            <div className="flex flex-wrap gap-4">
              {conditions.map((condition) => (
                <label key={condition} className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.condition.includes(condition)}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        condition: checked
                          ? [...prev.condition, condition]
                          : prev.condition.filter((c) => c !== condition),
                      }))
                    }
                  />
                  {condition.replace("_", " ")}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={filters.hasNotes}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    hasNotes: checked as boolean,
                  }))
                }
              />
              Has Notes
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={filters.hasHighlights}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    hasHighlights: checked as boolean,
                  }))
                }
              />
              Has Highlights
            </label>
          </div>

          <div className="space-y-2">
            <Label>
              Price Range: ${filters.minPrice} - ${filters.maxPrice}
            </Label>
            <RangeSlider
              min={0}
              max={250}
              step={5}
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={([min, max]) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice: min,
                  maxPrice: max,
                }))
              }
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
