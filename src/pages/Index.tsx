import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MyThirdPlace</h1>
              <p className="text-sm text-muted-foreground">Community Platform</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/admin/login')}
            className="admin-focus"
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            MyThirdPlace Admin Panel
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Comprehensive management system for your community platform. Control users, events, communities, 
            and analytics all from one powerful dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate('/admin/login')}
              className="admin-focus"
            >
              <Shield className="h-5 w-5 mr-2" />
              Access Admin Panel
            </Button>
            <Button variant="outline" size="lg" className="admin-focus">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Analytics
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card className="admin-shadow hover:shadow-lg admin-transition">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Manage user accounts, roles, and permissions with advanced filtering and bulk operations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="admin-shadow hover:shadow-lg admin-transition">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Create and manage communities, track member growth, and organize events.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="admin-shadow hover:shadow-lg admin-transition">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Event Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Schedule events, manage registrations, and track attendance across all communities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="admin-shadow hover:shadow-lg admin-transition">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Real-time insights into user engagement, event performance, and platform growth.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 MyThirdPlace. Professional community management platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
