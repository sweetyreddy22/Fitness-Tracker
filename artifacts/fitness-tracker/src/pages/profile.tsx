import { useGetProfile, useUpsertProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProfileQueryKey, getGetBmiResultQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { data: profile, isLoading } = useGetProfile();
  const upsertProfile = useUpsertProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setAge(profile.age?.toString() || "");
      setGender(profile.gender || "");
      setHeightCm(profile.heightCm?.toString() || "");
      setWeightKg(profile.weightKg?.toString() || "");
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertProfile.mutate({
      data: {
        name,
        email,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        heightCm: heightCm ? parseInt(heightCm) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBmiResultQueryKey() });
        toast({ title: "Profile updated successfully" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your physical details for accurate tracking and BMI calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" min="0" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input id="heightCm" type="number" min="0" value={heightCm} onChange={e => setHeightCm(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input id="weightKg" type="number" min="0" step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={upsertProfile.isPending}>
              {upsertProfile.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
